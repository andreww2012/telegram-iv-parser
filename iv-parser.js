const process = require('process');
require('pretty-error').start();
const log = require('loglevel');
const {join} = require('path');

require('yargs')
  .commandDir(join(__dirname, 'src/commands'))
  .demandCommand(1, 'Please specify the command')
  .help()
  .argv;

process.on('unhandledRejection', err => {
  log.error('Unhandled rejection occured:');
  log.trace(err);
  process.exit(1);
});
