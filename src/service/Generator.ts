import { DirNode, FileNode } from './FileTree';
import { List, Map } from 'immutable';
import webinarTransfer from '../Factory/WebinarFactory';
import offlineTransfer from '../Factory/OfflineFactory';
import assetTransfer from '../Factory/AssetFactory';
import getVersions from './Versions';
import Render from './Render';
import Utils from '../Utils';
import fileTree from './FileTree';
const path = require('path');
const template = require('art-template');
const traverse = require('traverse');
const replaceall = require('replaceall');
import { process } from './TextProcessor';
import DataParser from '../DataParser';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

type File = { name: string; content: string; path: string };
// given a file node, return the corresponding html file[] (in case of several versions)
const generate = async (
  node: FileNode,
  dist: string,
  category: 'webinar' | 'offline' | 'asset'
): Promise<File[]> => {
  const parser = new DataParser(node.path, category);
  // this is the versions corresponding to this single file node, so it is one - many relationship.
  const versions = List(getVersions(parser.data));
  let transfer;
  switch (category) {
    case 'webinar':
      transfer = webinarTransfer;
      break;
    case 'offline':
      transfer = offlineTransfer;
      break;
    case 'asset':
      transfer = assetTransfer;
      break;
  }

  const outputs = Promise.all(
    versions.map(async (v) => {
      const htmlName = node.name.replace('.xlsx', '.html');

      const name =
        v.alias.length > 0 ? `(${v.alias.join('-')})${htmlName}` : htmlName;

      let data = await transfer(v.data);
      // this is special, I would like to add ch-en space in data side, so it's like a middle-ware insert here
      traverse(data).forEach(function (x) {
        if (typeof x === 'string') {
          // console.log(x);

          this.update(process(x));
          // this.update(Utils.quotationProcess(x));
        }
      });

      const path = savePath(node, dist);
      const view = template(
        __dirname + `/../pages/${Utils.capital(category)}/index.art.html`,
        data
      );
      return Map({ name, path, content: view });
    })
  );
  return <File[]>List(await outputs).toJS();
};

// given a file node and a root dist path, tell the absolute save dir path
const savePath = (node: FileNode, distPath: string) => {
  const fullPath = path.resolve(path.join(distPath, node.relativePath));
  return path.dirname(fullPath);
};

// makedir recursively for certain dir path
const mkMulDir = (dirPath: string) => {
  if (existsSync(dirPath)) return;
  const parentDir = path.resolve(dirPath, '..');
  if (!existsSync(parentDir)) mkMulDir(parentDir);
  mkdirSync(dirPath);
};

// for each file node, build compiled file in the dist
const buildSingle = async (
  node: FileNode,
  distPath: string,
  category: 'webinar' | 'offline' | 'asset'
) => {
  if (node.name.includes('.xlsx')) {
    const data = await generate(node, distPath, category);
    data.forEach((x) => {
      const fullPath = path.resolve(x.path, x.name);
      mkMulDir(x.path);
      writeFileSync(fullPath, x.content);
      console.log(`${x.name} generate successfully!`);
    });
  }
};

// run over the whole tree, get each file node and do something...
const travel = async (
  tree: DirNode,
  distPath: string,
  category: 'asset' | 'webinar' | 'offline',
  f
) => {
  for (let node of tree.children) {
    switch (node.type) {
      case 'FILE':
        try {
          await f(node, distPath, category);
        } catch (e) {
          // it's the console, and if some node got wrong, it won't affect others
          console.log(node.path);
          console.log(e);
          continue;
        }
        break;
      case 'DIR':
        await travel(node, distPath, category, f);
        break;
    }
  }
};

const build = (
  origin: string,
  dist: string,
  category: 'asset' | 'webinar' | 'offline'
) => {
  const tree = fileTree(origin);
  travel(tree, dist, category, buildSingle);
};
// test script
// const cat = 'asset';
// const dist = `../../${cat}/excel`;
// const tree = fileTree(`../../${cat}/excel`);
export { build };
