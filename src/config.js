const {join} = require('path');

const defaultDirName = '.ivparser';

module.exports = {
  dirs: {
    defaultDirName,
    reportsDir: join(defaultDirName, 'reports'),
    reportsTempDir: join(defaultDirName, 'reports', '_temp'),
    sitesDir: join(defaultDirName, 'sites'),
  },
};
