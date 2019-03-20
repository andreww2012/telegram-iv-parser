/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const process = require('process');
const inquirer = require('inquirer');
const cssWhat = require('css-what');
const shell = require('shelljs');
const {validateSiteSectionSchema} = require('../validator');

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

/**
 * Generates a parsing file structure
 * @param {object} answers parameters
 * @return {string} Generated structure
 */
function generateBasicFileStructure(answers) {
  const currentTimestamp = new Date().getTime();

  const {
    host,
    sectionName,
    pagePattern,
    firstPageUrl,
    linkSelector,
    paginationLastPageSelector,
    paginationReversed,
    articleBodySelector,
    selectorsThatMustBeIgnored,
  } = answers;

  const ignoreSelectors = selectorsThatMustBeIgnored
    .split(',')
    .map(s => s.trim())
    .filter(s => {
      try {
        // Throws an exception when a selector is invalid
        return cssWhat(s);
      } catch (error) {
        return false;
      }
    });

  const structure = {
    options: {
      host,
      name: sectionName,

      section: {
        pagePattern,
        firstPageUrl,
        linkSelector,
      },

      pagination: {
        totalNumberOfPagesSelector: paginationLastPageSelector,
        reversed: paginationReversed,
        enabled: true,
      },

      page: {
        articleBodySelector,
        ignoreSelectors,
        ignoreTags: [],
        preserveTags: [],
        ignoreClasses: [],
        preserveClasses: [],
        ignoreAttributes: [],
        preserveAttributes: [],
      },

      parsingStrategy: {
        __not_done_yet__: true,
      },
    },

    stats: {
      pagesCount: 0,
      fileGeneratedDate: currentTimestamp,
      parsingDates: [],
    },

    pages: [],
    parsingResults: {
      tags: [],
      classes: [],
      attributes: [],
      unsupported: [],
    },
    articles: [],
  };

  const isSchemaValid = validateSiteSectionSchema(structure);

  if (!isSchemaValid) {
    console.error('It it not possible to generate a valid file. Probably the schema is broken. Errors:', validateSiteSectionSchema.errors);
    process.exit(1);
  }

  return JSON.stringify(structure);
}

exports.handleGenerate = ({folder = '.sites'}) => {
  inquirer.prompt(fileStructureQuestions)
    .then(answers => {
      const {host, sectionName} = answers;

      shell.mkdir('-p', folder);

      const filename = `${host}-${sectionName}.json`;
      const filepath = path.join(folder, filename);
      const fileStructure = generateBasicFileStructure(answers);

      fs.writeFileSync(filepath, fileStructure);

      console.log(`[file created] ${filepath}`);
    })
    .catch(e => {
      console.log('An error occured:', e);
    });
};
