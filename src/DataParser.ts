var XLSX = require('xlsx');
import * as _ from 'lodash';
import { BasicData } from './typings/Excel';

export default class DataParser {
  public workbook;
  public sheetNames;
  public agendaNames;
  public data;
  constructor(fileName: string) {
    this.data = {};
    this.workbook = XLSX.readFile(fileName, {
      type: 'binary',
      cellText: false,
      cellDates: true,
      raw: false,
      strip: false,
      dateNF: 'dd"."mm"."yyyy',
    });
    this.sheetNames = this.workbook.SheetNames;

    this.agendaNames = this.extractAgendaNames(this.sheetNames);
    this.data.basic = this.parseBasic('Utilities');
    this.data.agendas = this.extractAgendaInfo(this.agendaNames);
    this.data.guests = this.guestsInfo('Guests');
    this.data.options = this.parseOptions('Options');
  }

  public parseBasic(sheetName: string) {
    const basic = XLSX.utils.sheet_to_json(this.workbook.Sheets[sheetName], {
      dateNF: 'dd/mm/yyyy',
    });
    const info = {};
    for (let item of basic) {
      info[item['模块']] = item['内容'];
    }
    return info;
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

  public extractAgendaNames(sheetNames: string[]) {
    return sheetNames.filter((sheetName) => sheetName.indexOf('Agenda') != -1);
  }

  public extractAgendaInfo(sheetNames: string[]) {
    const agendas: string[][][] = sheetNames.map((sheetName) => {
      let data: string[][] = XLSX.utils.sheet_to_json(
        this.workbook.Sheets[sheetName],
        {
          header: 1,
          dateNF: 'HH:MM',
          raw: false,
        }
      );
      data = data.slice(2);
      data = data.filter((item) => item.length > 0);
      return data;
    });

    return agendas;
  }
}
