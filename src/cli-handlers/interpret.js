const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');
const normalizeUrl = require('normalize-url');
const {parse: json2csv} = require('json2csv');
const dateFns = require('date-fns');
const shell = require('shelljs');
const {validateSiteSectionSchema} = require('../validator');

const defaultReportsFolder = '.reports';

exports.handleInterpret = ({filename, reportFolder = defaultReportsFolder}) => {
  let filePath = path.normalize(filename);

  if (!filename.endsWith('.json')) {
    filePath = `${filePath}.json`;
  }

  const fileContents = jsonfile.readFileSync(filePath);

  if (!validateSiteSectionSchema(fileContents)) {
    throw new Error('File contents does not match the schema');
  }

  const {host, name} = fileContents.options;
  const {parsingResults} = fileContents;

  const currDate = new Date();

  const dayFormatted = dateFns.format(currDate, 'DD-MM-YYYY');
  const timeFormatted = dateFns.format(currDate, 'HH-mm-ss');

  Object.keys(parsingResults).forEach(key => {
    const currParsingResults = parsingResults[key];

    currParsingResults.forEach(result => {
      const {articles} = result;
      const firstArticles = [articles[0], articles[1], articles[2], articles[3]].filter(a => a);
      delete result.articles;
      firstArticles.forEach((articleId, i) => {
        const articleRelativeUrl = fileContents.articles
          .find(a => a.hash === articleId)
          .url;
        const fullArticleUrl = normalizeUrl(`${host}/${articleRelativeUrl}`);
        result[`article${i}`] = fullArticleUrl;
      });
    });

    const csv = json2csv(currParsingResults);

    const folder = path.normalize(`${reportFolder}/${host}/${name}/${dayFormatted}/${timeFormatted}/`);
    shell.mkdir('-p', folder);

    const fileName = `${key}_${host}_${name}_${dayFormatted}_${timeFormatted}.csv`;
    const fullPath = path.normalize(`${folder}/${fileName}`);

    fs.writeFileSync(fullPath, csv);
  });
};
