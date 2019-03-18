const fs = require('fs');
const {fetchTypesEnum, fetch} = require('./fetcher');
// const {readFileAndValidate} = require('../utils');

/**
 * Returns fetcher job
 * @param {object} file file contents
 * @return {object}
 */
function generateFetcherJob(file) {
  if (file.stats.parsingDates.length === 0) {
    return {
      type: fetchTypesEnum.fetchPageCount,
      data: {
        file,
        targetData: null,
      },
    };
  }

  return null;
}

/**
 * Do the parsing iteration
 * @param {number} fileDescriptor file descriptor
 * @param {string} fileContents initial file contents
 */
async function startParsing(fileDescriptor, fileContents) {
  console.log('Parsing is starting...');

  const fetcherJob = generateFetcherJob(fileContents);

  if (fetcherJob) {
    const result = await fetch(fetcherJob);
  } else {
    console.log('Nothing left to parse. Stopping the process...');
    setImmediate(() => {
      fs.closeSync(fileDescriptor);
      process.exit(0);
    });
  }
}

exports.startParsing = startParsing;
