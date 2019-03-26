const fs = require('fs');
const {Parser} = require('../parser');
const config = require('../config');

module.exports = {
  command: 'launch <sitename> [section] [period]',
  aliases: ['start', 'parse', 's'],
  describe: 'Starts parsing process for all sections',
  builder: {
    period: {
      alias: 'p',
      default: 0,
      describe: 'Delay between requests (in ms)',
    },
  },

  handler({sitename, section, period}) {
    let sections = [];

    if (section) {
      sections.push(`${section}.json`);
    } else {
      const files = fs.readdirSync(`${config.dirs.sitesDir}/${sitename}`);
      sections = files.filter(ssName => ssName.endsWith('.json'));
    }

    sections.forEach((sectionName, i) => {
      const timeout = 1000 * i;
      setTimeout(() => {
        new Parser(
          `${config.dirs.sitesDir}/${sitename}/${sectionName}`,
          period,
        ).startParsingLoop();
      }, timeout);
    });
  },
};
