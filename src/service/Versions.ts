const _ = require('lodash');
import { List, Map, Set } from 'immutable';
import { ListFormat } from 'typescript';
import DataParser from '../DataParser';
// versions: implementation syntax - , which we can use as generate different versions of files

// key1: [{alias, value}, {alias, value}]
type AliasCollector = { value: string; alias: string };
const keyAliasMap = (rawData: any) => {
  const { basic } = rawData;
  const result = {};
  for (let rawKey in basic) {
    if (rawKey.includes('-')) {
      try {
        const [key, alias] = rawKey.split('-').map((x) => x.trim());
        if (result.hasOwnProperty(key))
          result[key].push({ value: basic[rawKey], alias });
        else result[key] = [{ value: basic[rawKey], alias }];
      } catch (e) {
        throw new SyntaxError('unknown usage of version generation -');
      }
    } else {
      // normal field
      result[rawKey] = [{ value: basic[rawKey], alias: null }];
    }
  }

  return Map(result);
};

// use a tree to represent all copies recursively, the leaves are just the answers
// isn't it elegant, hhh :)

const dataTree = (aliasMap: Map<string, any>): List<Map<string, string[]>> => {
  for (let key in aliasMap.toJS()) {
    const value = aliasMap.get(key);
    if (value.length > 1) {
      const middlePos = Math.floor(value.length / 2);
      const leftNode = dataTree(aliasMap.set(key, value.slice(0, middlePos)));
      const rightNode = dataTree(aliasMap.set(key, value.slice(middlePos)));
      return leftNode.concat(rightNode);
    }
  }
  return List([aliasMap]);
};

// polish the leaves
const treeToVersions = (
  data: List<Map<string, string[]>>
): List<Map<string, List<string> | Map<string, string>>> => {
  // deal with single version

  const generateSingle = (
    item: Map<string, string[]>,
    aliasCollector: List<string> = List([]),
    keyCollector: List<string> = List([])
  ) => {
    for (let key in item.toJS()) {
      const v = item.toJS()[key];
      let alias = v[0]['alias'];
      if (alias && !keyCollector.contains(key)) {
        return generateSingle(
          item,
          aliasCollector.push(alias),
          keyCollector.push(key)
        );
      }
    }
    return Map({ alias: aliasCollector, data: item });
  };
  const aliasData = data.map((item) => generateSingle(item));
  // hereby, we still keep alias in each field, this lines is deleting them
  return aliasData.map((x) => {
    const newData = x.get('data').map((x) => x[0].value);
    return x.set('data', newData);
  });
};

type Version = { alias: string[]; data: string };
export default function versions(rawData): Version[] {
  const aliasMap = keyAliasMap(rawData);
  const tree = dataTree(aliasMap);
  const versions = treeToVersions(tree).toJS();
  return versions.map((x) => {
    const x1 = _.cloneDeep(x);
    const rawData1 = _.cloneDeep(rawData);
    rawData1.basic = x1.data;
    x1.data = rawData1;
    return x1;
  });
}
// const d = new DataParser('../../asset/excel/Asset Template.xlsx', 'asset');
// console.log(versions(d.data));
