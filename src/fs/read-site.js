const path = require('path');
const jsonfile = require('jsonfile');
const {validateSchema} = require('../schema');
const config = require('../config');

/**
 * Reads site file
 * @param {string} host host
 * @param {string} section section
 * @return {any} file contents
 */
function readSite(host, section) {
  const fullPath = path.resolve(`${config.dirs.sitesDir}/${host}/${host}-${section}.json`);

  const fileContents = jsonfile.readFileSync(fullPath);

  const fileValid = validateSchema(fileContents);

  if (!fileValid) {
    throw new Error(`Cannot open ${fullPath}: does not match the schema`);
  }

  return fileContents;
}

exports.readSite = readSite;
