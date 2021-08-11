import Render from './Render';
import { Guest } from './typings/Offline';
import axios from 'axios';
const replaceall = require('replaceall');
const _ = require('lodash');

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
      } else if (accumulator.length === 0) accumulator.push([item]);
      else if (typeof accumulator[accumulator.length - 1] === 'string')
        accumulator.push([item]);
      else accumulator[accumulator.length - 1].push(item);
    }
  }
  // remove blank strings
  const removeBlankStringAcc = accumulator.filter(
    (value: Paragraph) => !(typeof value === 'string' && !value.trim())
  );
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
function dateProcess(date) {
  const timeZoneOffset = 8;
  //   if (!date) return '';
  date.setHours(date.getHours() + timeZoneOffset);
  return `${date.getFullYear()} 年 ${
    date.getMonth() + 1
  } 月 ${date.getDate()} 日`;
}

function agendaProcess(agendas, guests) {
  const parsedAgendas = [];
  for (let agenda of agendas) {
    const parsedAgenda = [];
    for (let item of agenda) {
      const parsedItem = { time: null, content: null, guests: null };
      parsedItem.time = `${item[0]} - ${item[1]}`;
      parsedItem.content = item[2];
      const names = item[3];
      const parsedNameList = nameParser(names);

      parsedItem.guests = namesMatch(parsedNameList, guests);
      parsedAgenda.push(parsedItem);
    }
    parsedAgendas.push(parsedAgenda);
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
      name: guest['姓名'].trim(),
      title: guest['职称'].trim(),
      introduction: textProcess(guest['简介'].trim(), 'single'),
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
function repSign(s) {
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

export default {
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
};
