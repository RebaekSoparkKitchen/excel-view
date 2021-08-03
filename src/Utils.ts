import Render from './Render';
import { Guest } from './typings/Offline';
import axios from 'axios';

function textProcess(text) {
  if (!text) return text;
  let str = text;
  str = str.replace(/\r\n/g, '<br>');
  str = str.replace(/\n/g, '<br><br>');

  //替换所有的空格（中文空格、英文空格都会被替换）
  str = str.replace(/\s/g, '&nbsp;');
  str = Render.replaceAll(str, '//', '<br><br>');
  str = Render.replaceAll(str, '：', ':');
  str = str.trim();
  return str;
}

// plus timezone offset and parse to string
function dateProcess(date) {
  const timeZoneOffset = 8;
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

function nameMatch(name: string, guests: Guest[]): Guest {
  for (let guest of guests) {
    if (name === guest.name) {
      return guest;
    }
  }
  return null;
}

function namesMatch(names: string[], guests: Guest[]): Guest[] {
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
      name: guest['姓名'],
      title: guest['职称'],
      introduction: guest['简介'],
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

export default {
  textProcess,
  dateProcess,
  agendaProcess,
  nameMatch,
  namesMatch,
  nameParser,
  guestsProcess,
  qrFactory,
};
