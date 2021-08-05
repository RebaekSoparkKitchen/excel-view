const template = require('art-template');
const fs = require('fs');
import DataParser from './DataParser';
import transfer from './Webinar/WebinarFactory';
import Render from './Render';

// given category, get the filenames in certain folder
const fileNames = (category: 'webinar' | 'offline'): string[] => {
  const names: string[] = [];
  const files: string[] = fs.readdirSync(`../${category}/excel`);
  files.forEach(function (item: string) {
    if (item.indexOf('xlsx') !== -1) {
      names.push(item.replace('.xlsx', ''));
    }
  });
  return names;
};

const generate = (category: 'webinar' | 'offline') => {
  // map webinar / offline to capital as the same with the folder name
  const capital = (str) => {
    return str.trim().toLowerCase().replace(str[0], str[0].toUpperCase());
  };
  // generate a single file
  const genSingle = (name: string) => {
    const parser = new DataParser(`../webinar/excel/${name}.xlsx`);

    transfer(parser.data).then((data) => {
      let webinar = template(
        __dirname + `/pages/${capital(category)}/event.art.html`,
        data
      );
      webinar = Render.addSpace(webinar);
      fs.writeFileSync(`../webinar/dist/${name}.html`, webinar);
    });
  };
  const fileList = fileNames(category);
  fileList.forEach((item) => genSingle(item));
};

generate('webinar');
