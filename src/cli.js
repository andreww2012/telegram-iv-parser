const yargs = require('yargs');

yargs.commandDir('commands')
  .demandCommand(1, 'Please specify the command')
  .help()
  .argv;
