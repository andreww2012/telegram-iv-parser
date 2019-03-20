const inquirer = require('inquirer');
const log = require('loglevel');
const {addNewSite} = require('../creator/addNewSite');

const fileStructureQuestions = [
  {
    name: 'host',
    message: 'Host name (test.ru, subdomain.example.com):',
    validate(input) {
      return !!input;
    },
  },

  {
    name: 'sectionName',
    message: 'Unique section name (latin symbols, hyphens and underscores):',
    validate(input) {
      return !!input;
    },
  },

  {
    name: 'paginationLastPageSelector',
    message: 'Selector containing page count (optional):',
  },

  {
    name: 'paginationReversed',
    message: 'If pagination reversed?',
    type: 'confirm',
    default: false,
  },

  {
    name: 'pagePattern',
    message: 'Section pages pattern (news/page/{0}.html):',
    validate(input) {
      return input && input.includes('{0}');
    },
  },

  {
    name: 'firstPageUrl',
    message: 'If the first page is not available by this pattern, specify a different URL for it (MUST SPECIFY WHEN PAGINATION IS REVERSED):',
    default: '',
    validate(input, {paginationReversed}) {
      return !(paginationReversed && !input);
    },
  },

  {
    name: 'linkSelector',
    message: 'Selector for article links:',
    validate(input) {
      return !!input;
    },
  },

  {
    name: 'articleBodySelector',
    message: 'Selector for article body:',
    validate(input) {
      return !!input;
    },
  },

  {
    name: 'selectorsThatMustBeIgnored',
    message: 'Selector(s) that must be ignored (comma separated):',
  },
];

module.exports = async () => {
  const answers = await inquirer.prompt(fileStructureQuestions);

  addNewSite(answers);

  log.info(`New site added: ${answers.host}`);
};
