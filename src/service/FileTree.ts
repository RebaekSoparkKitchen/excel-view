import { Map, List } from 'immutable';
const fs = require('fs');
const path = require('path');
// add node may be not that exactly correct, just for avoid duplicate File type with DOM lib
export type FileNode = {
  name: string;
  path: string;
  relativePath: string;
  type: 'FILE';
};
export type DirNode = {
  name: string;
  path: string;
  relativePath: string;
  type: 'DIR';
  children: (FileNode | DirNode)[];
};

// given a directory path, eithor absolute or relative path, return the file tree which root is this directory
const fileTree = (dirPath: string): DirNode => {
  // simply generate dirPath and give us Node
  const genNode = (dirPath: string): Map<string, string | List<any>> => {
    const name = path.basename(dirPath);
    const fullPath = path.resolve(dirPath);
    // rootPath is using closure
    const relativePath = path.relative(rootPath, dirPath);
    if (fs.statSync(dirPath).isFile())
      return Map({
        name,
        path: fullPath,
        relativePath,
        type: 'FILE',
      });
    else
      return Map({
        name,
        path: fullPath,
        relativePath,
        type: 'DIR',
        children: List([]),
      });
  };

  // given a path, return [full path, children's full path list]
  const getPaths = (dirPath: string) => {
    // f is just a helper function to recursively collect children names
    const f = (dirPath: string, childrenNames: List<string>) => {
      if (childrenNames.size === 0) {
        return List([dirPath, List([])]);
      } else {
        const currentName = childrenNames.get(0);
        const fullPath = path.resolve(path.join(dirPath, currentName));
        return List([
          dirPath,
          List([fullPath]).merge(f(dirPath, childrenNames.delete(0)).get(1)),
        ]);
      }
    };

    // get full path
    const fileDir = path.resolve(dirPath);
    const childrenNames: List<string> = List(fs.readdirSync(dirPath));
    return f(fileDir, childrenNames);
  };
  // g is actually the main function to generate the tree
  // @params: dirPath : the full path of the root dir
  // @params: childrenPaths: the full paths of the children of the root dir
  // @params: tree: the file tree
  const g = (
    dirPath: string,
    childrenPaths: List<string>,
    tree: Map<string, any>
  ) => {
    if (!childrenPaths || childrenPaths.size === 0) return tree;
    else {
      const childrenNodes = tree.get('children');
      const firstPath = childrenPaths.get(0);

      if (fs.statSync(firstPath).isFile()) {
        const currentNode = genNode(firstPath);
        const thisBranch = tree.set(
          'children',
          childrenNodes.push(currentNode)
        );
        const thisChildren = thisBranch.get('children');
        const otherChildren = g(dirPath, childrenPaths.delete(0), tree).get(
          'children'
        );
        return thisBranch.set('children', thisChildren.merge(otherChildren));
      } else {
        // directory case
        const currentChildrenPaths = getPaths(firstPath).get(1);
        // thisRoot important! we should change the root! I stuck here for several hours!
        const thisRoot = genNode(firstPath);
        return tree.set(
          'children',
          childrenNodes
            .push(g(firstPath, currentChildrenPaths, thisRoot))
            .merge(g(dirPath, childrenPaths.delete(0), tree).get('children'))
        );
      }
    }
  };
  const rootPath = dirPath;
  // root node of the tree
  const rootNode = genNode(dirPath);

  return g(getPaths(dirPath).get(0), getPaths(dirPath).get(1), rootNode).toJS();
};

export default fileTree;
