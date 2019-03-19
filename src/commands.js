const yargs = require('yargs');
const cliHandlers = require('./cli-handlers');

exports.commands = yargs
  .command({
    command: 'generate [folder]',
    aliases: ['gen'],
    desc: `Generates a new parsing file with a skeleton structure`,
    handler: cliHandlers.generate,
  })
  .command({
    command: 'parse <filename>',
    aliases: ['start'],
    desc: 'Starts parsing process',
    handler: cliHandlers.parse,
  })
  .command({
    command: 'interpret <filename> [report-folder]',
    aliases: ['stats', 'csv', 'info'],
    desc: 'Generates CSV report',
    handler: cliHandlers.interpret,
  });
