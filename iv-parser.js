require('pretty-error').start();
const yargs = require('yargs');
require('./src/commands');

yargs.demandCommand(1, 'Please specify the command')
  .help()
  .argv;
