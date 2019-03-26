const inquirer = require('inquirer');
const {addNewSite} = require('../creator');
const {addSiteQuestions} = require('../questions');

module.exports = {
  command: 'add',
  aliases: 'new',
  describe: 'Adds a new site',

  async handler() {
    const answers = await inquirer.prompt(addSiteQuestions);
    addNewSite(answers);
  },
};
