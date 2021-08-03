const fs = require('fs');
const path = require('path');

const readDirAllFile = (filepath) => {
  const fileNames = [];
  let files = fs.readdirSync(filepath);
  for (let file of files) {
    let fileTruePath = path.join(filepath, file);
    if (fileTruePath.indexOf('xlsx') != -1) fileNames.push(fileTruePath);
  }
  return fileNames;
};

//let all = readDirAllFile('./data');
//console.log(all);
export default readDirAllFile;
