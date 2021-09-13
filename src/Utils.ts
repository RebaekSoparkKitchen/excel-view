import Render from './service/Render';
import { Guest } from './typings/Offline';
import axios from 'axios';
import { ScheduleItem } from './typings/Offline';
const replaceall = require('replaceall');
const _ = require('lodash');
const cheerio = require('cheerio');

// find all patterns in the text and return the index list
// params：text : the long content need to be scaned
// params： pattern : the string need to be found, say /n
// params：index : start point, very often we use 0, I set it basicly for the recursive call
function findPatterns(
  text: string,
  pattern: string,
  index: number = 0
): number[] {
  const str = text.slice(index);
  const pos = str.indexOf(pattern);
  const currentIndex = index + pos;

  if (pos === -1) return [];
  else
    return [currentIndex].concat(findPatterns(text, pattern, currentIndex + 1));
}

// basic function
// x : a number to be compared
// xs: an array there, I need to find the neareast number bigger than x
function findNearestBiggerNum(x: number, xs: number[]) {
  // campare function for sort
  function compare(x: number, y: number) {
    if (x < y) {
      return -1;
    } else if (x > y) {
      return 1;
    } else {
      return 0;
    }
  }

  const sortedXs = xs.sort(compare);
  if (sortedXs.length === 0) return null;
  else if (sortedXs[0] < x) return findNearestBiggerNum(x, sortedXs.slice(1));
  else return sortedXs[0];
}

function liContentsList(text: string) {
  const lineBreaks = findPatterns(text, '\n');

  const liTagCharacters = findPatterns(text, '•');

  if (liTagCharacters.length === 0) return [];
  if (liTagCharacters.length === 1) {
    const biggerIndex = findNearestBiggerNum(liTagCharacters[0], lineBreaks);
    if (biggerIndex) return [text.substring(liTagCharacters[0], biggerIndex)];
    return text.slice(liTagCharacters[0]);
  } else
    return [text.substring(liTagCharacters[0], liTagCharacters[1])].concat(
      liContentsList(text.slice(liTagCharacters[1]))
    );
}

// transfer text to list, the core part, recognize paragraph
type Paragraph = string | string[];
function splitParagraph(text: string): Paragraph[] {
  if (!text) return [];
  const splitedText = text.split('\n');
  // we split it too much, need to glue li tag contents
  const accumulator = [];
  if (splitedText.length === 0) return [];
  else {
    for (let i = 0; i < splitedText.length; i++) {
      const item = splitedText[i].trim();
      if (item.indexOf('•') === -1) {
        accumulator.push(item);
      } else {
        // in this scope, we are dealing with the sentence with •
        const liTagItem = item.replace('•', '').trim();
        if (accumulator.length === 0) accumulator.push([liTagItem]);
        else if (typeof accumulator[accumulator.length - 1] === 'string')
          accumulator.push([liTagItem]);
        else accumulator[accumulator.length - 1].push(liTagItem);
      }
    }
  }
  // remove blank strings
  const removeBlankStringAcc = accumulator.filter(
    (value: Paragraph) => !(typeof value === 'string' && !value.trim())
  );
  const first_sentence = removeBlankStringAcc[0];
  // tolerance, if they provide something like 尊敬的嘉宾 , then delete it.
  const maxGreetingLength = 20;
  if (
    first_sentence.indexOf('尊敬的') !== -1 &&
    first_sentence.length < maxGreetingLength
  ) {
    return removeBlankStringAcc.slice(1);
  }
  return removeBlankStringAcc;
}

function paragraphListToText(paragraph: Paragraph[]) {
  const liProcess = (lis: string[]) => {
    let str = '';
    lis.forEach((li) => {
      let text = replaceall('•', '', li);
      text = replaceall('\t', '', text);
      text = `<li>${text.trim()}</li>`;
      str += text;
    });
    return `<ul>${str}</ul><br>`;
  };
  const strProcess = (text: string, last: boolean = false) => {
    if (!last) return `<div>${text.trim()}</div><br>`;
    return `<div>${text.trim()}</div>`;
  };

  if (paragraph.length === 0) return '';
  else if (typeof paragraph[0] === 'string') {
    if (paragraph.length === 1)
      return (
        strProcess(paragraph[0], true) + paragraphListToText(paragraph.slice(1))
      );
    return (
      strProcess(paragraph[0], false) + paragraphListToText(paragraph.slice(1))
    );
  } else
    return liProcess(paragraph[0]) + paragraphListToText(paragraph.slice(1));
}

function paragraphText(text: string) {
  return repSign(paragraphListToText(splitParagraph(text)));
}

function textProcess(text, type = 'double') {
  if (!text) return text;
  let str = text;
  str = str.replace(/[\r\n]{2,}/g, '\n');
  const lineBreaks = type === 'double' ? '<br><br>' : '<br>';
  str = Render.replaceAll(str, /\r\n/g, lineBreaks);
  str = Render.replaceAll(str, /\n/g, lineBreaks);

  //替换所有的空格（中文空格、英文空格都会被替换）
  str = Render.replaceAll(str, /\s/g, '&nbsp;');
  str = Render.replaceAll(str, '//', lineBreaks);
  str = Render.replaceAll(str, '：', ':');
  str = str.trim();
  return str;
}

// plus timezone offset and parse to string
function dateProcess(dateStr: string) {
  // const timeZoneOffset = 8;
  // if (!date) return '';
  // date.setHours(date.getHours() + timeZoneOffset);
  // return `${date.getFullYear()} 年 ${
  //   date.getMonth() + 1
  // } 月 ${date.getDate()} 日`;
  if (typeof dateStr === 'string') {
    const date = dateStr.split('/');
    return `${date[2]} 年 ${~~date[1]} 月 ${~~date[0]} 日`;
  }
}

function agendaProcess(agendas, guests) {
  const parsedAgendas = [];
  for (let agenda of agendas) {
    const parsedAgenda = [];
    let hasGuestCol = false;
    for (let item of agenda.data) {
      const time = `${item[0]} - ${item[1]}`;
      const content = item[2];
      const names = item[3];
      const details = item[4];
      const parsedNameList = nameParser(names);
      if (names && names.length > 0 && names.trim() != '嘉宾') {
        hasGuestCol = true;
      }
      const parsedGuests = namesMatch(parsedNameList, guests);
      const parsedItem: ScheduleItem = {
        time,
        content,
        details,
        guests: parsedGuests,
      };
      parsedAgenda.push(parsedItem);
    }

    parsedAgendas.push({
      hasGuestCol,
      agenda: parsedAgenda,
      remark: agenda.remark,
      title: agenda.title,
    });
  }
  return parsedAgendas;
}

function namesMatch(names: string[], guests: Guest[]): Guest[] {
  function nameMatch(name: string, guests: Guest[]): Guest {
    for (let guest of guests) {
      if (name && guest.name && name.trim() === guest.name.trim()) {
        return guest;
      }
    }
    return null;
  }
  const filterdGuests = [];
  for (let name of names) {
    const guest = nameMatch(name, guests);
    if (guest) filterdGuests.push(guest);
  }
  return filterdGuests;
}

function nameParser(names: string): string[] {
  if (names) {
    const nameList = names.split(';');
    const trimedNameList = [];
    nameList.forEach((name) => trimedNameList.push(name.trim()));
    return trimedNameList;
  } else return [];
}

function guestsProcess(rawGuests) {
  const parsedGuests = [];
  for (let guest of rawGuests) {
    const parsedGuest = {
      name: guest['姓名']?.trim(),
      title: guest['职称']?.trim(),
      introduction: textProcess(guest['简介']?.trim(), 'single'),
      company: '',
    };
    parsedGuests.push(parsedGuest);
  }
  return parsedGuests;
}

async function qrFactory(url: string): Promise<string> {
  // request
  const options = {
    auth: {
      username: 'sapuser',
      password: 'secret_189',
    },
  };
  const encodeUrl = encodeURIComponent(url);

  const { data: qrData } = await axios.post(
    'https://events.sap.cn/home/generate-qr/',
    `url=${encodeUrl}`,
    options
  );

  return qrData.qr;
}

// change english character to chinese character
function repSign(s: string): string {
  s = s.replace(
    /([\u4E00-\u9FA5]|^|\n|\r)([\,\.\?\!])(?=[\u4E00-\u9FA5]|$|\n|\r)/g,
    function (u, v, w, x) {
      const sign = {
        ',': '，',
        '.': '。',
        '?': '？',
        '!': '！',
      };
      return sign[w] ? v + sign[w] : u;
    }
  );
  return s;
}

type version = { alias: string; url: string; data: any };

function versionProcess(rawData): version[] {
  const links = [];
  const { basic } = rawData;
  for (let key in basic) {
    if (key.indexOf('报名链接') !== -1) {
      const alias =
        key.indexOf('-') === -1
          ? ''
          : key.split('-')[key.split('-').length - 1].trim();
      const url =
        typeof basic[key] === 'string' ? basic[key].trim() : basic[key];
      links.push({ alias, url });
      delete basic[key];
    }
  }
  for (let item of links) {
    // basic['报名链接'] = item.url;
    const data = _.cloneDeep(rawData);
    data.basic['报名链接'] = item.url;
    item.data = data;
  }
  return links;
}

const setParams = (link, param, value) => {
  let linkText = link;
  if (link.indexOf('http') === -1) {
    linkText = `https://${link}`;
  }
  const url = new URL(linkText);
  url.searchParams.set(param, value);
  return url.href;
};

// ioiSourceMap
const ioiSourceMap = (data, ioiLib) => {
  for (let value in ioiLib) {
    if (
      ioiLib[value] &&
      data &&
      ioiLib[value].toLowerCase() === data.toLowerCase()
    )
      return value;
  }
  return data;
};

// 无关的span要去掉
// ul的解析生成
// 只保留a , b, i三个标签
// 还是要做智能的段落判断
const htmlTextProcess = (str: string, url: string[], ioi: string = '') => {
  // remove <span xxx> and </span>
  if (!str) return '';
  let text = str.replace(/<span[^>]+>/gim, '');
  text = replaceall(`<br/>`, `\n`, text);
  text = replaceall(`<br>`, `\n`, text);
  text = replaceall(`</span>`, '', text);
  if (text) text = text.trim();
  // replace transfer character
  text = replaceall(`&lt;`, `<`, text);
  text = replaceall(`&gt;`, `>`, text);
  if (url && url.length > 1) {
    text = replaceall(`<a2>`, `<a href="${url[1]}">`, text);
    text = replaceall(`</a2>`, `</a>`, text);
  } else {
    // from business, some users don't provide URL2 but use <a2>
    if (text.indexOf('<a2>') !== -1 || text.indexOf('</a2>') !== -1)
      throw new Error('No URL2 but <a2> found');
  }
  // deal with <a> grammer
  const $ = cheerio.load(text, null, false);
  $('a').each(function (i, elem) {
    if (!url)
      throw new Error(
        'You are not allowed using <a> feature here since no default url found'
      );
    if (!$(this).attr('href')) {
      $(this).attr('href', url[0]);
    }
    $(this).attr('data-sap-hpa-ceimo-link-alias', 'CTA');
    $(this).attr('data-sap-hpa-ceimo-ioi-link', ioi);
  });

  return $.html();
};

const capital = (str) => {
  return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase());
};
// const test = `<span style="font-size:11pt;"><b>据调查</b></span><span style="font-size:11pt;">,到 2023 年，65% 的<a href="www.baidu.com">企业</a>将</span><span style="font-size:11pt;">投资高度</span><span style="font-size:11pt;">可配置且</span><span style="font-size:11pt;"><i>具备 AI 功能的 ERP 应用</i></span><span style="font-size:11pt;">，提高业务运营的自动化水平。而且，实现数字化转型后，企业能够应对业务中断危机，并构建创新型业务模式。<br/><br/><a>本 IDC 报告</a>重点介绍了：<br/>•\t如何专注于数字化转型战略<br/>•\t为什么转型至关重要<br/>•\t为什么智慧企业需要采用合适的技术<br/>•\t为什么客户倾向于采用集成式软件应用套件<br/>•\t如何借助数字化转型和智能技术，提高业务韧性<br/><br/>查看本报告，了解为何数字化技术对打造智慧企业至关重要。</span>`;
// const a = htmlTextProcess(test, 'www.sap.com');
// console.log(paragraphText(a));

export default {
  htmlTextProcess,
  splitParagraph,
  paragraphText,
  textProcess,
  dateProcess,
  agendaProcess,
  namesMatch,
  nameParser,
  guestsProcess,
  qrFactory,
  repSign,
  versionProcess,
  setParams,
  ioiSourceMap,
  capital,
};
