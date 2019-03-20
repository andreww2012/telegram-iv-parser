const yargs = require('yargs');
const cliHandlers = require('./cli-handlers');

exports.commands = yargs
  .command({
    command: 'generate [folder]',
    aliases: ['gen'],
    desc: `Generates a new parsing file with a skeleton structure`,
    handler: cliHandlers.handleGenerate,
  })
  .command({
    command: 'launch <filename>',
    aliases: ['start', 'parse'],
    desc: 'Starts parsing process',
    builder: {
      period: {
        alias: 'p',
        default: 500,
        describe: 'Period per requests',
      },
    },
    handler: cliHandlers.handleParse,
  })
  .command({
    command: 'report <filename> [report-folder]',
    aliases: ['stats', 'csv', 'info'],
    desc: 'Generates CSV report',
    handler: cliHandlers.handleReport,
  });
