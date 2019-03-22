const process = require('process');
require('pretty-error').start();
require('./src/fs').initStructure();

require('yargs').commandDir('src/commands')
  .demandCommand(1, 'Please specify the command')
  .help()
  .argv;

process.on('unhandledRejection', err => {
  console.error('Unhandled rejection occured:', err);
  process.exit(1);
});
