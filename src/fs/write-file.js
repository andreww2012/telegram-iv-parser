const path = require('path');
const jsonfile = require('jsonfile');
const {createDir} = require('./createDir');

/**
 * Creates JSON file
 * @param {string} filePath directory path
 * @param {string} fileName file name
 * @param {string} fileContents file contents
 */
function writeFile(filePath, fileName, fileContents) {
  createDir(filePath);

  const fullPath = path.join(filePath, fileName);

  jsonfile.writeFileSync(fullPath, fileContents);
}

exports.writeFile = writeFile;
