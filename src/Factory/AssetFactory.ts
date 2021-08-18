import DataParser from '../DataParser';
import { Asset } from '../typings/Asset';
import Utils from '../Utils';
import { getIoiMap } from '../model/ioiMap';

const textTrim = (str: string) => {
  return str ? str.trim() : '';
};
const transfer = async (rawData): Promise<Asset> => {
  const { basic } = rawData;
  const previewText = '为您带来 SAP 的最新资讯';
  const banner = `https://www.sap.com/dam/site/campaigns/photos/0640x0192/${basic['Hero Image ID']}_email_hero_0640_0192.jpg`;
  const code = textTrim(basic['CRM Campaign Code']);
  const subject = textTrim(basic['Subject']);
  // add campaign code and process the url link
  const link = Utils.setParams(
    textTrim(basic['URL'] || basic['URL1'] || basic['URL 1']),
    'campaigncode',
    code
  );
  let link2;
  if (basic['URL2'] || basic['URL 2']) {
    link2 = Utils.setParams(
      textTrim(basic['URL2'] || basic['URL 2']),
      'campaigncode',
      code
    );
  }
  const footerButton = {
    text: textTrim(basic['Footer CTA']),
    href: link2 ? link2 : link,
  };
  const heroButton = { text: textTrim(basic['Hero CTA']), href: link };

  const ioiLib = await getIoiMap();
  const ioi = Utils.ioiSourceMap(basic['IOI'], ioiLib);
  const mainText = Utils.paragraphText(
    Utils.htmlTextProcess(basic['Body'], link2 ? [link, link2] : [link], ioi)
  );

  const title = Utils.textProcess(basic['Headline'], 'single');

  // console.log(ioiLib);

  return {
    previewText,
    banner,
    code,
    subject,
    heroButton,
    footerButton,
    mainText,
    title,
    ioi,
  };
};

export default transfer;
