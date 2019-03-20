const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');
const shell = require('shelljs');
const {validateSiteSectionSchema} = require('../validator');
const {ReportGenerator} = require('../report');

const defaultReportsFolder = '.reports';

exports.handle = commands => {
  const {
    filename,
    reportFolder = defaultReportsFolder,
  } = commands;

  let filePath = path.normalize(filename);

  if (!filename.endsWith('.json')) {
    filePath = `${filePath}.json`;
  }

  const fileContents = jsonfile.readFileSync(filePath);

  if (!validateSiteSectionSchema(fileContents)) {
    throw new Error('File contents does not match the schema');
  }

  const reportGenerator = new ReportGenerator(fileContents);

  const {
    context,
    html,
  } = reportGenerator.generate();

  const {host, sectionName, day, time} = context;

  const folder = path.normalize(
    `${reportFolder}/${host}/${sectionName}/${day}/${time}/`,
  );
  shell.mkdir('-p', folder);

  const fileName = `${host}_${sectionName}_${day}_${time}.html`;
  const fullPath = path.normalize(`${folder}/${fileName}`);

  fs.writeFileSync(fullPath, html);
};
