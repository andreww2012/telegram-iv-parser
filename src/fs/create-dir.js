const path = require('path');
const shell = require('shelljs');

/**
 * Creates directories if they don't exist
 * @param {string|array} fullPath full path
 */
function createDir(fullPath) {
  let directoriesToCreate = typeof fullPath === 'string'
    ? [fullPath]
    : fullPath;
  directoriesToCreate = directoriesToCreate.map(d => path.normalize(d));
  shell.mkdir('-p', ...directoriesToCreate);
}

exports.createDir = createDir;
