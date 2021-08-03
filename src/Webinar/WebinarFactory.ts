import Utils from '../Utils';
import { Webinar } from '../typings/Webinar';
import { ButtonColor } from '../typings/Webinar';

import DataParser from '../DataParser';
import Render from '../Render';
const fs = require('fs');
const template = require('art-template');

const transfer = async (rawData): Promise<Webinar> => {
  const { basic, agendas, guests: rawGuests } = rawData;
  const guests = Utils.guestsProcess(rawGuests);
  const previewText = '为您带来 SAP 的最新咨询';
  const banner = basic['Banner'];
  const code = basic['CRM Campaign Code'];
  const subject = basic['邮件标题'];
  const button = { text: '立即报名', href: basic['报名链接'] };

  const hasGuestCol = true;
  const hasGuestIntro = true;
  const mainText = Utils.textProcess(basic['邮件正文']);
  const meetingTime = Utils.dateProcess(basic['会议日期']);
  const meetingUrl = basic['报名链接'];
  const registerUrl = basic['报名链接'];
  const meetingAudience = basic['参会对象'];
  const qr = await Utils.qrFactory(meetingUrl);
  const schedule = Utils.agendaProcess(agendas, guests);

  const title = Utils.textProcess(basic['正文标题']);
  const ioi = '';
  const buttonColor: ButtonColor = 'black' as ButtonColor;
  const promotionButtonColor: ButtonColor = 'blue' as ButtonColor;
  const options = {
    buttonColor: buttonColor,
    title: false,
    date: false,
    promotionButton: {
      enable: false,
      color: promotionButtonColor,
      text: '',
      url: '',
    },
  };
  return {
    previewText,
    banner,
    code,
    subject,
    button,
    guests,
    hasGuestCol,
    hasGuestIntro,
    mainText,
    meetingTime,
    meetingUrl,
    registerUrl,
    meetingAudience,
    qr,
    schedule,
    title,
    ioi,
    options,
  };
};

const parser = new DataParser('./装饰服务.xlsx');
transfer(parser.data).then((data) => {
  let webinar = template(__dirname + '/../pages/Webinar/event.art.html', data);
  webinar = Render.addSpace(webinar);
  fs.writeFileSync('./webinar.html', webinar);
});
