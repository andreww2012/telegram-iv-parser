const process = require('process');
require('pretty-error').start();
const log = require('loglevel');
require('./src/cli');

process.on('unhandledRejection', err => {
  log.error('Unhandled rejection occured:');
  log.trace(err);
  process.exit(1);
});
