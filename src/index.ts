import { build } from './service/Generator';
const config = require('../config.json');

const main = (cat: 'asset' | 'webinar' | 'offline') => {
  const { asset, webinar, offline } = config.excelTemplate;
  let templatePath: string;
  switch (cat) {
    case 'asset':
      templatePath = asset;
      break;
    case 'webinar':
      templatePath = webinar;
      break;
    case 'offline':
      templatePath = offline;
      break;
  }
  build(templatePath, templatePath, cat);
};

// main('asset');
// main('webinar');
main('offline');
