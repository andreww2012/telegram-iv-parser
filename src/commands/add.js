const inquirer = require('inquirer');
const log = require('loglevel');
const {addNewSite} = require('../creator/addNewSite');
const {addSiteQuestions} = require('../questions');

module.exports = {
  command: 'add',
  aliases: 'new',
  describe: 'Adds a new site',

  async handler() {
    const answers = await inquirer.prompt(addSiteQuestions);

    addNewSite(answers);

    log.info(`New site added: ${answers.host}`);
  },
};
