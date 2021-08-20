import { DirNode, FileNode } from './FileTree';
import { List, Map, Record } from 'immutable';
import webinarTransfer from '../Factory/WebinarFactory';
import offlineTransfer from '../Factory/OfflineFactory';
import assetTransfer from '../Factory/AssetFactory';
import getVersions from './Versions';
import Render from './Render';
import Utils from '../Utils';
import fileTree from './FileTree';
const path = require('path');
const template = require('art-template');

import DataParser from '../DataParser';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

type File = { name: string; content: string; path: string };
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

      const data = await transfer(v.data);
      const path = savePath(node, dist);
      const view = template(
        __dirname + `/../pages/${Utils.capital(category)}/index.art.html`,
        data
      );
      const compiledView = Render.addSpace(view);
      return Map({ name, path, content: compiledView });
    })
  );
  return <File[]>List(await outputs).toJS();
};

// given a file node and a root dist path, tell the absolute save dir path
const savePath = (node: FileNode, distPath: string) => {
  const fullPath = path.resolve(path.join(distPath, node.relativePath));
  return path.dirname(fullPath);
};

// if all path set, do something : cb
const mkMulDir = (dirPath: string) => {
  if (!existsSync(dirPath)) {
    const parentDir = path.resolve(dirPath, '..');
    if (!existsSync(parentDir)) {
      mkMulDir(parentDir);
    }
    mkdirSync(dirPath);
  }
};

const build = async (
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
      // if (!existsSync(x.path)) {
      //   mkdirSync(x.path);
      // }
      // writeFileSync(fullPath, x.content);
    });
  }
};

// run over the whole tree, get each file node and do something...
const travel = async (tree: DirNode, distPath, category, f) => {
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

// test script
const dist = '../../asset/dist';
const tree = fileTree('../../asset/excel');
travel(tree, dist, 'asset', build);
// console.log(path.resolve(dist, '..'));

// const btp = <DirNode>tree.children[tree.children.length - 1];
// const btp1 = <DirNode>btp.children[4];
// const file2 = <FileNode>btp1.children[1];
// console.log(file2);

// const file1: FileNode = <FileNode>tree.children[2];

// generate(file2, dist, 'asset').then((data) => {
//   console.log(data[0].name);
//   console.log(data[0].path);
//   console.log(data[1].name);
//   console.log(data[1].path);
// });
