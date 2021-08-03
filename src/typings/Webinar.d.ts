// webinar event
interface Guest {
  name: string;
  title: string;
  company: string;
  introduction: string;
}

interface ScheduleItem {
  time: string;
  content: string;
  guest: Guest[];
}

interface Button {
  text: string;
  href?: string;
}

export interface PromotionButton {
  enable: boolean;
  text: string;
  color: 'blue' | 'black';
  url: string;
}

export interface Options {
  title: boolean;
  date: boolean;
  buttonColor: ButtonColor;
  promotionButton: PromotionButton;
}

export type ButtonColor = 'black' | 'blue';

export interface Webinar {
  previewText: string;
  banner: string;
  code: string;
  subject: string;
  team?: string;
  button: Button;
  guests: Guest[];
  hasGuestCol: boolean;
  hasGuestIntro: boolean;
  mainText: string;
  meetingTime: string;
  meetingAudience?: string;
  meetingUrl: string;
  registerUrl?: string;
  qr: string;
  schedule: ScheduleItem[];
  title: string;
  ioi: string;
  options: Options;
}
