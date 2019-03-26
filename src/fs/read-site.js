const path = require('path');
const jsonfile = require('jsonfile');
const fancylog = require('fancy-log');
const {validateSchema} = require('../schema');
const config = require('../config');

/**
 * Reads site file
 * @param {string} host host
 * @param {string} section section
 * @return {any} file contents
 */
function readSite(host, section) {
  const fullPath = path.resolve(`${config.dirs.sitesDir}/${host}/${section}.json`);

  let fileContents = '';

  try {
    fileContents = jsonfile.readFileSync(fullPath);
  } catch (error) {
    fancylog.error(`Error occured during opening the file ${fullPath}: ${error.message}`);
    return;
  }

  const fileValid = validateSchema(fileContents);

  if (!fileValid) {
    fancylog.error(`Cannot open ${fullPath}: file does not match the schema`);
    console.log(validateSchema.errors);
    return;
  }

  return fileContents;
}

exports.readSite = readSite;
