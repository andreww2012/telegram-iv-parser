const fs = require('fs');
const path = require('path');
const {startParsing} = require('../parser');
const {readFileAndValidate} = require('../utils');

exports.handleParse = ({filename}) => {
  let filenameNormalized = filename;
  let filePath = path.normalize(filenameNormalized);
  let fileExists = fs.existsSync(filePath);

  if (!fileExists) {
    filenameNormalized = `${filename}.json`;
    filePath = path.normalize(filenameNormalized);
    fileExists = fs.existsSync(filePath);
  }

  if (!fileExists) {
    console.error(`${filePath}: file does not exist`);
    process.exit(1);
  }

  const fileDescriptor = fs.openSync(filePath, 'rs+');

  readFileAndValidate(fileDescriptor)
    .then(fileContents => startParsing(fileDescriptor, fileContents))
    .catch(err => {
      console.error('Something went wrong:', err);
      process.exit(1);
    });
};
