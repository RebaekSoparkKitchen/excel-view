const template = require('art-template');
const fs = require('fs');
import DataParser from './DataParser';
import webinarTransfer from './Factory/WebinarFactory';
import offlineTransfer from './Factory/OfflineFactory';
import Render from './Render';
import Utils from './Utils';

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
    const parser = new DataParser(
      `../${category}/excel/${name}.xlsx`,
      category
    );
    const versions = Utils.versionProcess(parser.data);
    const render = (data, saveName, category) => {
      let view = template(
        __dirname + `/pages/${capital(category)}/event.art.html`,
        data
      );
      view = Render.addSpace(view);
      fs.writeFileSync(`../${category}/dist/${saveName}.html`, view);
    };
    if (category === 'webinar') {
      for (let item of versions) {
        const saveName = item.alias ? `${item.alias} - ${name}` : name;
        webinarTransfer(item.data).then((data) => {
          render(data, saveName, category);
        });
      }
    } else {
      render(offlineTransfer(parser.data), name, category);
    }
  };
  const fileList = fileNames(category);
  fileList.forEach((item) => genSingle(item));
};

generate('offline');
// console.log(fileNames('offline'));
