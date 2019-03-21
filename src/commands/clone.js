const {addSection} = require('../creator');

module.exports = {
  command: 'clone <sitename> <section> <newsection>',
  aliases: 'cl',
  describe: 'Adds a file section based on a specified one',

  handler({sitename, section, newsection}) {
    addSection(sitename, section, newsection);
  },
};
