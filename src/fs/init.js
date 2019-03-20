const config = require('../config');
const {createDir} = require('./create-dir');

/**
 * Creates IV parser file structure
 */
function initStructure() {
  const directoriesToCreate = [
    config.dir.defaultDirectoryName,
    ...config.dir.subDirectories,
  ];

  createDir(directoriesToCreate);
}

exports.initStructure = initStructure;
