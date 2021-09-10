var XLSX = require('xlsx');
import * as _ from 'lodash';
import { BasicData } from './typings/Excel';
type Agenda = { title: string; data: string[][] };

export default class DataParser {
  public workbook;
  public sheetNames;
  public agendaNames;
  public data;
  public category;
  constructor(fileName: string, category: 'webinar' | 'offline' | 'asset') {
    this.data = {};
    this.workbook = XLSX.readFile(fileName, {
      type: 'binary',
      cellText: false,
      cellDates: true,
      raw: false,
      strip: false,
      dateNF: 'dd"."mm"."yyyy',
    });
    // console.log(this.workbook['Sheets']['Utilities']);

    this.sheetNames = this.workbook.SheetNames;
    this.category = category;
    this.data.basic = this.parseBasic('Utilities');

    if (category === 'webinar' || category === 'offline') {
      this.agendaNames = this.extractAgendaNames(this.sheetNames);
      this.data.agendas = this.extractAgendaInfo(this.agendaNames);
      this.data.guests = this.guestsInfo('Guests');
      this.data.options = this.parseOptions('Options');
    } else {
      this.data.offers = this.parseOffers('Offers');
    }
  }

  public parseBasic(sheetName: string) {
    const basic = XLSX.utils.sheet_to_json(this.workbook.Sheets[sheetName], {
      dateNF: 'dd/mm/yyyy',
      raw: false,
    });

    const info = {};
    const data = this.workbook['Sheets']['Utilities'];
    for (let item of basic) {
      if (item['模块'] === 'Body' || item['模块'] === '邮件正文') {
        const bodyCell = `B${this.findKeyIndex(item['模块'], data)}`;
        info[item['模块']] =
          this.workbook['Sheets']['Utilities'][bodyCell]['h'];
      } else {
        info[item['模块']] = item['内容'];
      }
    }
    // console.log(info);

    return info;
  }

  private findKeyIndex(key: string, data: any) {
    for (let i in data) {
      if (
        i.indexOf('A') !== -1 &&
        data[i]['v'] &&
        data[i]['v'].trim() === key
      ) {
        return i.replace('A', '');
      }
    }
    return null;
  }

  public parseOptions(sheetName: string) {
    const basic = XLSX.utils.sheet_to_json(this.workbook.Sheets[sheetName], {
      dateNF: 'dd/mm/yyyy',
    });
    const info = {};
    for (let item of basic) {
      info[item['设置']] = item['内容'];
    }
    return info;
  }

  public guestsInfo(sheetName: string) {
    return XLSX.utils.sheet_to_json(this.workbook.Sheets[sheetName], {
      dateNF: 'dd/mm/yyyy',
    });
  }

  public parseOffers(sheetName: string) {
    return XLSX.utils.sheet_to_json(this.workbook.Sheets[sheetName], {
      dateNF: 'dd/mm/yyyy',
    });
  }

  public extractAgendaNames(sheetNames: string[]) {
    return sheetNames.filter((sheetName) => sheetName.indexOf('Agenda') != -1);
  }

  public extractAgendaInfo(sheetNames: string[]) {
    const agendas: Agenda[] = sheetNames.map((sheetName) => {
      let data: string[][] = XLSX.utils.sheet_to_json(
        this.workbook.Sheets[sheetName],
        {
          header: 1,
          dateNF: 'HH:MM',
          raw: false,
        }
      );
      const title = this.category === 'offline' ? data[1][1] : '';
      const remark = this.category === 'offline' ? data[2][1] : '';
      data = this.category === 'offline' ? data.slice(4) : data.slice(2);
      data = data.filter((item) => item.length > 0);

      return { data, title, remark };
    });

    return agendas;
  }
}
