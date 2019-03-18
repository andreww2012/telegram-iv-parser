const normalizeUrl = require('normalize-url');
const axios = require('axios');
const cheerio = require('cheerio');

const fetchTypesEnum = {
  fetchPageCount: 'fetchPageCount',
  fetchPageLinks: 'fetchPageLinks',
  fetchArticle: 'fetchArticle',
};

/**
 * Fetches the specified page
 * @param {string} url normalized url
 */
async function fetchPage(url) {
  try {
    const response = await axios({
      url,
      validateStatus: null,
      maxRedirects: 10,
    });

    const {status, data} = response;

    return {
      requestSuccess: true,
      httpSuccess: (status >= 200 && status < 300),
      status,
      data,
    };
  } catch (error) {
    return {
      requestSuccess: false,
      error,
    };
  }
}

/**
 * Fetches page count
 * @param {object} data data
 */
async function fetchPageCount(data) {
  const {options} = data.file;
  const {host} = options;
  const {firstPageUrl} = options.section;
  const {totalNumberOfPagesSelector} = options.pagination;

  const urlNorm = normalizeUrl(`${host}/${firstPageUrl}`);

  const result = await fetchPage(urlNorm);

  if (result.httpSuccess) {
    const $ = cheerio.load(result.data);
    const count = +$(totalNumberOfPagesSelector).text();
    return {
      count,
    };
  }

  return {
    error: true,
  };
}

/**
 * Fetches data using the task description
 * @param {object} taskDescription task description
 */
async function fetch(taskDescription) {
  const {
    type: taskType,
    data,
  } = taskDescription;

  let fetcherFunction;

  switch (taskType) {
  case fetchTypesEnum.fetchPageCount:
    fetcherFunction = fetchPageCount;

  default:
  }

  if (fetcherFunction) {
    return await fetcherFunction(data);
  }
}

exports.fetchTypesEnum = fetchTypesEnum;
exports.fetch = fetch;
