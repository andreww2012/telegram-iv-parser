const {Parser} = require('../parser');
const config = require('../config');

module.exports = {
  command: 'launch <sitename> <section> [period]',
  aliases: ['start', 'parse'],
  describe: 'Starts parsing process',
  builder: {
    period: {
      alias: 'p',
      default: 0,
      describe: 'Delay between requests (in ms)',
    },
  },

  handler({sitename, section, period}) {
    new Parser(
      `${config.dirs.sitesDir}/${sitename}/${section}.json`,
      period,
    ).startParsingLoop();
  },
};
