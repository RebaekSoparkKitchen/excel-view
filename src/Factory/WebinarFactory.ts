import Utils from '../Utils';
import { Webinar } from '../typings/Webinar';
import { ButtonColor } from '../typings/Webinar';

import DataParser from '../DataParser';
import Render from '../service/Render';
const fs = require('fs');
const template = require('art-template');

const transfer = async (rawData): Promise<Webinar> => {
  const { basic, agendas, guests: rawGuests } = rawData;
  const rawAgendaData = agendas.map((agenda) => agenda.data);
  const guests = Utils.guestsProcess(rawGuests);
  const previewText = '为您带来 SAP 的最新咨询';
  const banner = basic['Banner']?.trim();
  const code = basic['CRM Campaign Code'];
  const subject = basic['邮件标题'];
  const button = { text: '立即报名', href: basic['报名链接'] };

  const hasGuestCol = true;
  const hasGuestIntro = true;
  const mainText = Utils.paragraphText(
    Utils.htmlTextProcess(basic['邮件正文'], null)
  );
  const meetingTime = Utils.dateProcess(basic['会议日期']);
  const meetingUrl = basic['报名链接'];
  const registerUrl = basic['报名链接'];
  const meetingAudience = basic['参会对象'];
  const qr = await Utils.qrFactory(meetingUrl);
  const schedule = Utils.agendaProcess(agendas, guests);

  const title = Utils.textProcess(basic['正文标题'], 'single');
  const ioi = '';
  const buttonColor: ButtonColor = 'black' as ButtonColor;
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

export default transfer;
