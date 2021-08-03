// offline event
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

interface Schedule {
  title: string;
  agenda: ScheduleItem[];
}

interface Contact {
  name: string;
  email: string;
  mobile: string;
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
  promotionButton: PromotionButton;
}

export interface Offline {
  previewText: string;
  banner: string;
  title: string;
  code: string;
  subject: string;
  team?: string;
  guests: Guest[];
  hasGuestCol: boolean;
  hasGuestIntro: boolean;
  mainText: string;
  meetingTime: any;
  qr: string;
  schedule: Schedule[];
  scheduleTitle: string[];
  ioi: string;
  options: Options;
  contact: Contact;
  city: string;
  meetingLocation: string;
}
