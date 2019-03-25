const {readSite, addFile} = require('../fs');
const config = require('../config');

/**
 * Clones existing section file
 * @param {string} sitename site name
 * @param {string} existingSection existing section name
 * @param {string} newSection new section name
 */
function addSection(sitename, existingSection, newSection) {
  const initialFile = readSite(sitename, existingSection);

  initialFile.options.name = newSection;
  initialFile.stats = {
    pagesCount: 0,
    fileGeneratedDate: new Date().getTime(),
    d: 0,
  };
  initialFile.pages = [];
  initialFile.parsingResults = [];
  initialFile.articles = [];

  const filePath = `${config.dirs.sitesDir}/${sitename}`;
  const fileName = `${newSection}.json`;

  addFile(filePath, fileName, initialFile);

  console.log(`File created: ${filePath}/${fileName}`);
}

exports.addSection = addSection;
