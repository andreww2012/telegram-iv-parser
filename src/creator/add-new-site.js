const cssWhat = require('css-what');
const config = require('../config');
const {addFile} = require('../fs');
const {validateSchema} = require('../schema');

/**
 * Generates a parsing file structure
 * @param {object} answers parameters
 * @return {object} Generated structure
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
      },
    },

    stats: {
      pagesCount: 0,
      fileGeneratedDate: currentTimestamp,
      d: 0,
    },

    pages: [],
    parsingResults: [],
    articles: [],
  };

  return structure;
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
    throw new Error(`It it not possible to generate a valid file. Probably the schema is broken.: ${JSON.stringify(validateSchema.errors)}`);
  }

  const filePath = `${config.dirs.sitesDir}/${host}`;
  const fileName = `${sectionName}.json`;

  addFile(filePath, fileName, fileContents);

  console.log(`File created: ${filePath}`);
}

exports.addNewSite = addNewSite;
