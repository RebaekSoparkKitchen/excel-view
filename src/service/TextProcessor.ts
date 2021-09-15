const replaceall = require('replaceall');
const isEnglish = require('is-english');
const pangu = require('pangu');
import Utils from '../Utils';

/**
 * deal with quotations in the text
 * @param text : target text
 * @returns the processed text
 */
const quotationProcess = (text: string) => {
  const findPatterns = Utils.findPatterns;
  let str = text;
  // first transfer all quotations to english quotations
  str = replaceall('“', '"', str);
  str = replaceall('”', '"', str);
  const positions = findPatterns(str, '"');
  if (positions.length % 2 !== 0)
    throw new Error('The frequency of quotation characters is odd number');

  for (let i = 0; i < positions.length / 2; i++) {
    const firstQuote = positions[i * 2];
    const secondQuote = positions[i * 2 + 1];

    const middleText = text.substring(firstQuote + 1, secondQuote);
    // check if all of them are english
    if (!isEnglish(middleText)) {
      str = str.substring(0, firstQuote) + '“' + str.substring(firstQuote + 1);
      str =
        str.substring(0, secondQuote) + '”' + str.substring(secondQuote + 1);
    }
  }
  return str;
};

/**
 * 在中英文之间加入一个空格
 * @param str - html文件字符串
 */
const addSpace = (str: string): string => {
  let text: string = pangu.spacing(str);
  // let text = spacer(str);
  /* ugly code, but it works, maybe good solution in the future...avoid wrong space brings by pangu.js */

  text = replaceall('< a', '<a', text);
  text = replaceall(' < a', '<a', text);
  text = replaceall('< b', '<b', text);
  text = replaceall(' < b', '<b', text);
  text = replaceall(' <b', '<b', text);
  text = replaceall(' </b', '</b', text);
  text = replaceall('< strong', '<strong', text);
  text = replaceall(' < strong', '<strong', text);
  text = replaceall(' <strong', '<strong', text);
  text = replaceall(' </strong', '<strong', text);
  text = replaceall(' < ', '<', text);
  text = replaceall('< ', '<', text);
  text = replaceall('& nbsp;', '&nbsp;', text);
  text = replaceall('& nbsp', '&nbsp', text);
  text = replaceall('& nbsp;', '&nbsp;', text);
  text = replaceall('< br>', '<br>', text);
  text = replaceall('< br >', '<br>', text);

  return text;
};

const uniProcess = (x: string, cbs) => {
  let str = x;
  for (let cb of cbs) {
    str = cb(str);
  }
  return str;
};

const process = (x: string) => {
  return uniProcess(x, [quotationProcess, addSpace]);
};

export { quotationProcess, addSpace, process };
