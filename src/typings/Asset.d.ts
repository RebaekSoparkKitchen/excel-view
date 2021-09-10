import { Button } from './Webinar';

export interface Offer {
  image: string;
  descriptionText: string;
  buttonText: string;
  url: string;
}
export interface Asset {
  previewText: string;
  banner: string;
  code: string;
  subject: string;
  heroButton?: Button;
  footerButton?: Button;
  mainText: string;
  title: string;
  ioi: string;
  offers?: Offer[];
}
