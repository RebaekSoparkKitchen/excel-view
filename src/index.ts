const template = require('art-template');
const fs = require('fs');
import DataParser from './DataParser';
import webinarTransfer from './Factory/WebinarFactory';
import offlineTransfer from './Factory/OfflineFactory';
import assetTransfer from './Factory/AssetFactory';
import Render from './service/Render';
import Utils from './Utils';
import getVersions from './service/Versions';

// given category, get the filenames in certain folder
const fileNames = (category: 'webinar' | 'offline' | 'asset'): string[] => {
  const pos = `../${category}/excel`;
  const names: string[] = [];
  const files: string[] = fs.readdirSync(pos);
  files.forEach(function (item: string) {
    console.log(item);
    fs;
    if (item.indexOf('xlsx') !== -1) {
      names.push(item.replace('.xlsx', ''));
    }
  });
  return names;
};

const generate = (category: 'webinar' | 'offline' | 'asset') => {
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
    const versions = getVersions(parser.data);

    const render = (data, saveName, category) => {
      let view = template(
        __dirname + `/pages/${capital(category)}/index.art.html`,
        data
      );
      view = Render.addSpace(view);
      fs.writeFileSync(`../${category}/dist/${saveName}.html`, view);
    };
    if (category === 'webinar') {
      for (let item of versions) {
        const saveName =
          item.alias.length !== 0 ? `(${item.alias.join('-')}) ${name}` : name;
        webinarTransfer(item.data).then((data) => {
          render(data, saveName, category);
        });
      }
    } else if (category === 'offline') {
      render(offlineTransfer(parser.data), name, category);
    } else if (category === 'asset') {
      const names = [];
      for (let item of versions) {
        let aliasPart = item.alias.join('-');
        if (names.includes(aliasPart)) {
          aliasPart += `'`;
          names.push(aliasPart);
        }
        const saveName =
          item.alias.length !== 0 ? `(${aliasPart}) ${name}` : name;
        names.push(aliasPart);
        assetTransfer(item.data).then((data) => {
          render(data, saveName, category);
        });
      }
    }
  };
  const fileList = fileNames(category);
  fileList.forEach((item) => genSingle(item));
};

generate('asset');
generate('offline');
generate('webinar');
