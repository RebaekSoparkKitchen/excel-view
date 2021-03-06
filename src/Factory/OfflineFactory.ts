import { Offline, Guest } from '../typings/Offline';
import DataParser from '../DataParser';
import Render from '../service/Render';
import Utils from '../Utils';
import { Button, ButtonColor } from '../typings/Webinar';

const fs = require('fs');
const template = require('art-template');

export default async function transfer(rawData): Promise<Offline> {
  const { basic, agendas, guests: rawGuests } = rawData;

  const guests = Utils.guestsProcess(rawGuests);

  const previewText = '为您带来 SAP 最新资讯';
  const subject = basic['邮件标题'];
  const banner = basic['Banner']?.trim();
  const title = Utils.textProcess(basic['正文标题'], 'single');
  const meetingUrl = basic['报名链接']?.trim();

  let button: Button;

  let qr = basic['qr'];
  if (meetingUrl) {
    button = { text: '立即报名', href: meetingUrl };
    qr = await Utils.qrFactory(meetingUrl);
  }
  const code = basic['CRM Campaign Code'];
  const mainText = Utils.paragraphText(
    Utils.htmlTextProcess(basic['邮件正文'], null)
  );

  const hasGuestCol = true;
  const hasGuestIntro =
    guests.filter((guest) => !!guest.introduction).length > 0;
  const meetingTime = Utils.dateProcess(basic['会议日期']);
  const city = basic['会议城市']?.trim();
  const meetingLocation = Utils.textProcess(
    basic['详细地点']?.trim(),
    'single'
  );
  const schedule = Utils.agendaProcess(agendas, guests);

  const promotionButtonColor: ButtonColor = 'blue' as ButtonColor;
  const options = {
    buttonColor: rawData.options['按钮颜色']
      ? rawData.options['按钮颜色']
      : 'black',
    title: rawData.options['标题显示'] ? rawData.options['标题显示'] : false,
    date: rawData.options['日期显示'] ? rawData.options['日期显示'] : false,
    promotionButton: {
      enable: false,
      color: promotionButtonColor,
      text: '',
      url: '',
    },
    guestDisplay: rawData.options['嘉宾介绍']
      ? rawData.options['嘉宾介绍']
      : false,
  };
  const ioi = '';
  const contact = {
    name: basic['联系人姓名'],
    mobile: basic['联系人电话'],
    email: basic['联系人邮箱'],
  };

  return {
    previewText,
    subject,
    banner,
    title,
    code,
    meetingUrl,
    button,
    mainText,
    hasGuestCol,
    hasGuestIntro,
    meetingTime,
    city,
    meetingLocation,
    qr,
    guests,
    schedule,
    options,
    ioi,
    contact,
  };
}

// const parser = new DataParser('../../offline/excel/offline.xlsx');
// const data = transfer(parser.data);
// const offline = template(__dirname + '/../pages/Offline/event.art.html', data);

// fs.writeFileSync('./offline.html', offline);
