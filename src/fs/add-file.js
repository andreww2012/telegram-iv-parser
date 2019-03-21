const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');
const {createDir} = require('./create-dir');

/**
 * Creates JSON file
 * @param {string} filePath directory path
 * @param {string} fileName file name
 * @param {string} fileContents file contents
 * @param {boolean} report if the file is a report
 */
function addFile(filePath, fileName, fileContents, report = false) {
  const fullPath = path.join(filePath, fileName);

  if (!report && fs.existsSync(fullPath)) {
    throw new Error(`File cannot be added as it already exists: ${fullPath}`);
  }

  createDir(filePath);

  if (report) {
    fs.writeFileSync(fullPath, fileContents);
  } else {
    jsonfile.writeFileSync(fullPath, fileContents);
  }
}

exports.addFile = addFile;
