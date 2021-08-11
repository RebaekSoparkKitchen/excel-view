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
  const link = Utils.setParams(textTrim(basic['URL']), 'campaigncode', code);
  const button = { text: textTrim(basic['CTA']), href: link };
  const mainText = Utils.textProcess(
    Utils.paragraphText(Utils.repSign(basic['Body']))
  );
  const title = Utils.textProcess(basic['Headline'], 'single');
  const ioiLib = await getIoiMap();
  console.log(basic['IOI']);

  // console.log(ioiLib);

  const ioi = Utils.ioiSourceMap(basic['IOI'], ioiLib);

  return { previewText, banner, code, subject, button, mainText, title, ioi };
};

export default transfer;
