const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer');
const {validateSiteSectionSchema} = require('../validators');

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
    message: 'Selector containing page count:',
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
];

/**
 * Generates a filename for the new parsing file with ".json" extension
 * @param {object} answers parameters
 * @return {string} Generated filename
 */
function generateFileName(answers) {
  return `${answers.host}-${answers.sectionName}.json`;
}

/**
 * Generates a parsing file structure
 * @param {object} answers parameters
 * @return {string} Generated structure
 */
function generateBasicFileStructure(answers) {
  const currentTimestamp = new Date().getTime();

  const {
    host,
    pagePattern,
    firstPageUrl,
    linkSelector,
    paginationLastPageSelector,
    paginationReversed,
    articleBodySelector,
  } = answers;

  const structure = {
    options: {
      host,

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
        ignoreSelectors: [],
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
    },
    articles: [],
  };

  const isSchemaValid = validateSiteSectionSchema(structure);

  if (!isSchemaValid) {
    console.error('It it not possible to generate a valid file. Probably the schema is broken. Errors:', validateSiteSectionSchema.errors);
    process.exit(1);
  }

  return JSON.stringify(structure, null, 2);
}

exports.handleGenerate = ({folder = '.'}) => {
  inquirer.prompt(fileStructureQuestions)
    .then(answers => {
      const filename = generateFileName(answers);

      const filepath = path.join(path.normalize(folder), filename);
      const fileStructure = generateBasicFileStructure(answers);

      fs.writeFileSync(filepath, fileStructure);

      console.log(`[file created] ${filepath}`);
    })
    .catch(e => {
      console.log('An error occured:', e);
    });
};
