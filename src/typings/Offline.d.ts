// offline event
export interface Guest {
  name: string;
  title: string;
  company: string;
  introduction: string;
}

export interface ScheduleItem {
  time: string;
  content: string;
  details?: string;
  guests: Guest[];
}

export interface Schedule {
  title?: string;
  hasGuestCol: boolean;
  agenda: ScheduleItem[];
  remark?: string;
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
  ioi: string;
  options: Options;
  contact: Contact;
  city: string;
  meetingLocation: string;
}
