const path = require('path');
const {Parser} = require('../parser');

module.exports = {
  command: 'launch <sitename> <section>',
  aliases: ['start', 'parse'],
  describe: 'Starts parsing process',
  builder: {
    period: {
      alias: 'p',
      default: 0,
      describe: 'An artificial delay between requests (in ms)',
    },
  },

  handler({filename, period}) {
    let filePath = path.normalize(filename);

    if (!filename.endsWith('.json')) {
      filePath = `${filePath}.json`;
    }

    new Parser(filePath, period).startParsingLoop();
  },
};
