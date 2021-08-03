import { Offline, Guest } from '../typings/Offline';
import DataParser from './DataParser';
import Render from './Render';
const fs = require('fs');
const template = require('art-template');

class OfflineFactory {
  public rawData;
  public production;
  constructor(rawData) {
    this.rawData = rawData;
    this.production = this.transfer(rawData);
  }

  public textProcess(text) {
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
  private dateProcess(date) {
    const timeZoneOffset = 8;
    date.setHours(date.getHours() + timeZoneOffset);
    return `${date.getFullYear()} 年 ${
      date.getMonth() + 1
    } 月 ${date.getDate()} 日`;
  }

  private agendaProcess(agendas, guests) {
    const parsedAgendas = [];
    for (let agenda of agendas) {
      const parsedAgenda = [];
      for (let item of agenda) {
        const parsedItem = { time: null, content: null, guests: null };
        parsedItem.time = `${item[0]} - ${item[1]}`;
        parsedItem.content = item[2];
        const names = item[3];
        const parsedNameList = this.nameParser(names);

        parsedItem.guests = this.namesMatch(parsedNameList, guests);
        parsedAgenda.push(parsedItem);
      }
      parsedAgendas.push(parsedAgenda);
    }
    return parsedAgendas;
  }

  public nameMatch(name: string, guests: Guest[]): Guest {
    for (let guest of guests) {
      if (name === guest.name) {
        return guest;
      }
    }
    return null;
  }

  public namesMatch(names: string[], guests: Guest[]): Guest[] {
    const filterdGuests = [];
    for (let name of names) {
      const guest = this.nameMatch(name, guests);
      if (guest) filterdGuests.push(guest);
    }
    return filterdGuests;
  }

  public nameParser(names: string): string[] {
    if (names) {
      const nameList = names.split(';');
      const trimedNameList = [];
      nameList.forEach((name) => trimedNameList.push(name.trim()));
      return trimedNameList;
    } else return [];
  }

  private guestsProcess(rawGuests) {
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

  public scheduleTitleProcess(basic) {
    const res = [];
    for (let item in basic) {
      if (item.indexOf('日程安排') !== -1 && item.indexOf('title') !== -1) {
        res.push(basic[item]);
      }
    }
    return res;
  }
  public transfer(data): Offline {
    const { basic, agendas, guests: rawGuests } = this.rawData;
    // console.log(agendas);
    const guests = this.guestsProcess(rawGuests);
    //console.log(this.namesMatch(['王二', '张三'], guests));

    const product: Offline = {
      previewText: '为您带来 SAP 最新资讯',
      subject: basic['邮件标题'],
      banner: basic['Banner'],
      title: basic['正文标题'],
      code: basic['CRM Campaign Code'],
      guests: guests,
      mainText: this.textProcess(basic['邮件正文']),
      hasGuestCol: true,
      hasGuestIntro: true,
      meetingTime: this.dateProcess(basic['会议日期']),
      city: basic['会议城市'],
      meetingLocation: basic['详细地点'],
      qr: basic['qr'],
      schedule: this.agendaProcess(agendas, guests),
      scheduleTitle: this.scheduleTitleProcess(basic),
      options: {
        title: true,
        date: true,
        promotionButton: { enable: false, color: 'blue', text: '', url: '' },
      },
      ioi: 'test',
      contact: {
        name: basic['联系人姓名'],
        mobile: basic['联系人电话'],
        email: basic['联系人邮箱'],
      },
    };
    return product;
  }
}
const parser = new DataParser('offline.xlsx');
const fac = new OfflineFactory(parser.data);
const data = fac.production;
const offline = template(__dirname + '/../pages/Offline/event.art.html', data);

fs.writeFileSync('./offline.html', offline);
