const process = require('process');
const cssWhat = require('css-what');
const log = require('loglevel');
const config = require('../config');
const {addFile} = require('../fs');
const {validateSchema} = require('../schema');

/**
 * Generates a parsing file structure
 * @param {object} answers parameters
 * @return {string} Generated structure
 */
function generateSiteFile(answers) {
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

  return JSON.stringify(structure);
}

/**
 * Adds a new site
 * @param {object} answers object with data
 */
function addNewSite(answers) {
  const {host, sectionName} = answers;

  const fileContents = generateSiteFile(answers);

  const isSchemaValid = validateSchema(fileContents);

  if (!isSchemaValid) {
    log.error(`It it not possible to generate a valid file.
      Probably the schema is broken.`);
    log(validateSchema.errors);
    process.exit(1);
  }

  const filePath = `${config.dirs.sitesDir}/${host}`;
  const fileName = `${sectionName}.json`;

  addFile(filePath, fileName, fileContents);

  log.info(`File created: ${filePath}`);
}

exports.addNewSite = addNewSite;
