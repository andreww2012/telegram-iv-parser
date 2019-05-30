const {addSection} = require('../creator');

module.exports = {
  command: 'clone <sitename> <section> <newsection>',
  aliases: ['c', 'cl', 'copy'],
  describe: 'Adds a file section based on a specified one',

  handler({sitename, section, newsection}) {
    newsection.split(',')
      .map(n => n.trim())
      .filter(n => n)
      .forEach(sectionName => addSection(sitename, section, sectionName));
  },
};
