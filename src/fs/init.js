const config = require('../config');
const {createDir} = require('./create-dir');

/**
 * Creates IV parser file structure
 */
function initStructure() {
  const directoriesToCreate = [
    config.dirs.defaultDirName,
    ...Object.values(config.dirs),
  ];

  createDir(directoriesToCreate);
}

exports.initStructure = initStructure;
