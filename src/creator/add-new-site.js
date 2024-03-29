const fancylog = require('fancy-log');
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
    subdomain,
    httpOnly,
    noPagination,
    paginationReversed,
    totalNumberOfPages,
    paginationStep,
    paginationTransform,
    sectionName,
    pagePattern,
    firstPageUrl,
    linkSelector,
    articleBodySelector,
    selectorsThatMustBeIgnored,
  } = answers;

  let pagesCount = 0;

  if (noPagination) {
    pagesCount = 1;
  } else if (!paginationReversed) {
    pagesCount = Number.MAX_SAFE_INTEGER;
  } else {
    pagesCount = totalNumberOfPages;
  }

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
        reversed: paginationReversed,
        enabled: !noPagination,
        step: paginationStep,
      },

      page: {
        articleBodySelector,
        ignoreSelectors: selectorsThatMustBeIgnored,
      },
    },

    stats: {
      pagesCount,
      fileGeneratedDate: currentTimestamp,
      d: 0,
    },

    pages: [],
    parsingResults: [],
    articles: [],
  };

  if (subdomain) {
    structure.options.subdomain = subdomain;
  }

  if (httpOnly) {
    structure.options.httpOnly = true;
  }

  if (paginationTransform) {
    structure.options.pagination.transform = paginationTransform;
  }

  return structure;
}

/**
 * Adds a new site
 * @param {object} answers object with data
 */
function addNewSite(answers) {
  const {host, sectionNames, pagePatterns} = answers;

  sectionNames.forEach(sectionName => {
    const pagePattern = pagePatterns.replace(/\{1\}/, sectionName);

    const fileContents = generateSiteFile({
      sectionName,
      pagePattern,
      ...answers,
    });

    const isSchemaValid = validateSchema(fileContents);

    if (!isSchemaValid) {
      fancylog.error(`It it not possible to generate a valid file for ${sectionName} section:`, validateSchema.errors);
    } else {
      const filePath = `${config.dirs.sitesDir}/${host}`;
      const fileName = `${sectionName}.json`;
      const fullFilePath = `${filePath}/${fileName}`;

      try {
        addFile(filePath, fileName, fileContents);
        fancylog.info(`File created: ${fullFilePath}`);
      } catch (error) {
        fancylog.error(`Error during the creation of the file for ${fullFilePath}:`, error);
      }
    }
  });
}

exports.addNewSite = addNewSite;
