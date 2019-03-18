const yargs = require('yargs');
const cliHandlers = require('./cli-handlers');

exports.commands = yargs
  .command({
    command: 'generate [folder]',
    aliases: ['gen'],
    desc: `Generates a new parsing file with a skeleton structure
          in the current folder by default`,
    handler: cliHandlers.generate,
  })
  .command({
    command: 'parse <filename>',
    aliases: ['start'],
    desc: 'Starts parsing process',
    handler: cliHandlers.parse,
  });
