const yargs = require('yargs');
require('./src/commands');

yargs.demandCommand()
  .help()
  .argv;
