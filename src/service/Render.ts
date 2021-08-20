/*
 * @Description:
 * @Author: FlyingRedPig
 * @Date: 2021-04-13 15:41:12
 * @LastEditors: FlyingRedPig
 * @LastEditTime: 2021-05-09 19:59:38
 */
const template = require('art-template');
const fs = require('fs');
const path = require('path');
const pangu = require('pangu');
const juice = require('juice');
const minify = require('html-minifier').minify;

// const spacer = require('../../helpers/spacer');

/**
 * receive Email (data type) and generate html file
 */
export default class Render {
  static replaceAll(word, targetText, newText) {
    let re = new RegExp(targetText, 'g');
    return word.replace(re, newText);
  }
  /**
   * 在中英文之间加入一个空格
   * @param str - html文件字符串
   */
  static addSpace = (str: string): string => {
    let text: string = pangu.spacing(str);
    // let text = spacer(str);
    /* ugly code, but it works, maybe good solution in the future...avoid wrong space brings by pangu.js */

    text = text.replace('< a', '<a');
    text = text.replace(' < a', '<a');
    text = text.replace('< b', '<b');
    text = text.replace(' < b', '<b');
    text = text.replace(' <b', '<b');
    text = text.replace(' </b', '</b');
    text = text.replace('< strong', '<strong');
    text = text.replace(' < strong', '<strong');
    text = text.replace(' <strong', '<strong');
    text = text.replace(' </strong', '<strong');
    text = text.replace(' < ', '<');
    text = text.replace('< ', '<');
    text = text.replace('& nbsp;', '&nbsp;');
    text = text.replace('& nbsp', '&nbsp');
    text = Render.replaceAll(text, '& nbsp;', '&nbsp;');
    text = Render.replaceAll(text, '< br>', '<br>');
    text = Render.replaceAll(text, '< br >', '<br>');

    return text;
  };

  /**
   * inline css
   * @param str - html文件字符串
   */
  static inlineCss = (str: string): string => {
    return juice(str);
  };

  /**
   * minify html
   * @param str - html文件字符串
   */
  static minifyHtml = (str: string): string => {
    return minify(str, {
      collapseWhitespace: true,
    });
  };

  /**
   * 完成 渲染 工作，将文件输出到dist文件夹
   * @param data - 输入EmailFactory生产出来的data，与已有的视图模板结合
   */
  public render(data, fileDir) {
    const templatePath: string = path.resolve('./templates/cn.art');
    const distPath: string = path.resolve(fileDir, `./${data.fileName}.html`);

    let page: string = template(templatePath, data);
    page = Render.addSpace(page);
    page = Render.inlineCss(page);
    //page = Render.minifyHtml(page);
    fs.writeFile(distPath, page, { encoding: 'utf8' }, (err) => {
      if (err) console.log(err);
    });
  }
}
