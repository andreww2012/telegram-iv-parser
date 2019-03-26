const {URL} = require('url');
const normalizeUrl = require('normalize-url');
const axios = require('axios');
const cheerio = require('cheerio');
const lodash = require('lodash');
const isAbsoluteUrl = require('is-absolute-url');
const {unsupportedPairs, tagsToIgnore, classesToIgnore} = require('./meta');

/**
 * Just fetcher
 */
class Fetcher {
  /**
   * @param {any} fetcherJob fetcher job descriptor
   * @param {any} fileContents current file contents
   */
  constructor(fetcherJob, fileContents) {
    this.jobDescriptor = fetcherJob;
    this.fileContents = fileContents;
    this.payload = null;
    this.fetchResult = null;
  }

  /**
   * @return {object}
   */
  static get fetchTypesEnum() {
    return {
      fetchPageCount: 'fetchPageCount',
      fetchPageLinks: 'fetchPageLinks',
      fetchArticle: 'fetchArticle',
    };
  }

  /**
   * @private
   * Fetches the specified page
   * @param {string} url normalized url
   */
  async fetchPage(url) {
    try {
      console.log(`[fetching] ${url}`);

      const response = await axios({
        url,
        validateStatus: null,
        maxRedirects: 10,
      });

      const {status, data} = response;

      this.fetchResult = {
        requestSuccess: true,
        httpSuccess: (status >= 200 && status < 300
          || status === 404
          || status === 410),
        status,
        response: data,
      };
    } catch (error) {
      this.fetchResult = {
        requestSuccess: false,
        error,
      };
    }
  }

  /**
   * @private
   * Fetches page count
   */
  async fetchPageCount() {
    const {options} = this.fileContents;
    const {host, subdomain} = options;
    const {firstPageUrl} = options.section;
    const {totalNumberOfPagesSelector} = options.pagination;

    // Not possible to get
    if (!totalNumberOfPagesSelector) {
      this.fetchResult = {};
      this.payload = {
        count: Number.MAX_SAFE_INTEGER,
      };
      return;
    }

    const urlNorm = normalizeUrl(
      `${subdomain ? subdomain + '.' : ''}${host}/${firstPageUrl}`,
      {forceHttps: true, stripWWW: false, removeTrailingSlash: false},
    );

    await this.fetchPage(urlNorm);

    const {httpSuccess, response} = this.fetchResult;

    if (httpSuccess) {
      const $ = cheerio.load(response);
      const count = +$(totalNumberOfPagesSelector).text();
      this.payload = {count};
    } else {
      this.payload = null;
    }
  }

  /**
   * @todo
   * @private
   * Parses page links
   */
  async fetchPageLinks({pageNum}) {
    const {fileContents} = this;
    const isFirstPage = fileContents.options.pagination.reversed
      ? pageNum === fileContents.stats.pagesCount
      : pageNum === 1;

    const {
      firstPageUrl,
      pagePattern,
      linkSelector,
    } = fileContents.options.section;

    const pageUrl = (isFirstPage && firstPageUrl)
      ? firstPageUrl
      : pagePattern.replace('{0}', pageNum);

    const {host, subdomain = ''} = fileContents.options;
    const urlNorm = normalizeUrl(
      `${subdomain ? subdomain + '.' : ''}${host}/${pageUrl}`,
      {forceHttps: true, stripWWW: false, removeTrailingSlash: false},
    );

    await this.fetchPage(urlNorm);
    const {httpSuccess, response} = this.fetchResult;

    const linkSelectors = typeof linkSelector === 'string'
      ? linkSelector
      : linkSelector.join(',');

    if (httpSuccess) {
      const $ = cheerio.load(response);
      const parsedUrls = [];
      $(linkSelectors).each((i, el) => {
        let {href} = el.attribs;
        if (href) {
          if (!isAbsoluteUrl(href)) {
            href = `${host}/${href}`;
          }
          const urlInfo = new URL(normalizeUrl(href));
          const normHostlessUrl = `${urlInfo.pathname}${urlInfo.search}`;
          parsedUrls.push(normHostlessUrl);
        }
      });
      this.payload = {parsedUrls};

      if (!parsedUrls.length) {
        this.payload.pageWithoutLinks = true;
      }
    } else {
      this.payload = null;
    }
  }

  /**
   * @todo
   * @private
   * Fetches an article
   */
  async fetchArticle({articleId}) {
    const {fileContents} = this;
    const {url: articleUrl} = fileContents.articles
      .find(a => a.hash === articleId);

    const {host, subdomain = ''} = this.fileContents.options;
    const urlNorm = normalizeUrl(
      `${subdomain ? subdomain + '.' : ''}${host}/${articleUrl}`,
      {forceHttps: true, stripWWW: false, removeTrailingSlash: false},
    );

    await this.fetchPage(urlNorm);

    const {httpSuccess, response} = this.fetchResult;

    if (httpSuccess) {
      const {articleBodySelector, ignoreSelectors} = fileContents.options.page;
      const $ = cheerio.load(response);

      let bodyElementsColleciton = $('*', articleBodySelector);

      ignoreSelectors.forEach(selectorThatMustBeIgnored => {
        bodyElementsColleciton = bodyElementsColleciton
          .not(selectorThatMustBeIgnored);
      });

      const bodyTags = [].slice.call(bodyElementsColleciton)
        .filter(e => e.type === 'tag');

      const tags = new Set();
      const attrs = new Set();
      const classes = new Set();
      const unsupported = new Set();

      bodyTags.forEach(el => {
        const {name, attribs} = el;
        tags.add(name);

        Object.keys(attribs).forEach(attr => {
          if (attr === 'class') {
            classes.add(...attribs[attr].split(' ').map(cl => `${cl}/${name}`));
          } else {
            attrs.add(`${attr}/${name}`);
          }
        });
      });

      unsupportedPairs.forEach(([tag1, tag2]) => {
        const targetElemsCollection = $(`${tag1} ${tag2}`, articleBodySelector);
        const targetTags = [].slice.call(targetElemsCollection)
          .filter(e => e.type === 'tag');

        targetTags.forEach(() => {
          unsupported.add(`${tag1}/${tag2}`);
        });
      });

      const tagsNormalized = lodash.pull([...tags], ...tagsToIgnore)
        .filter(e => e);

      const attrsNormalized = [...attrs].filter(e => !e.includes('"'));

      const classesNormalized = [...classes].filter(className => {
        return className
          && !classesToIgnore.some(classRegex => classRegex.test(className));
      });

      const unsupportedNormalized = [...unsupported].filter(e => e);

      this.payload = {
        tags: tagsNormalized,
        attrs: attrsNormalized,
        classes: classesNormalized,
        unsupported: unsupportedNormalized,
      };
    } else {
      this.payload = null;
    }
  }

  /**
   * @public
   * Fetches data using the task description
   */
  async fetch() {
    const {
      type: taskType,
      data,
    } = this.jobDescriptor;

    let fetcherFunction;

    switch (taskType) {
    case Fetcher.fetchTypesEnum.fetchPageCount:
      fetcherFunction = this.fetchPageCount;
      break;

    case Fetcher.fetchTypesEnum.fetchPageLinks:
      fetcherFunction = this.fetchPageLinks;
      break;

    case Fetcher.fetchTypesEnum.fetchArticle:
      fetcherFunction = this.fetchArticle;
      break;

    default:
    }

    if (fetcherFunction) {
      return await fetcherFunction.bind(this)(data);
    } else {
      this.fetchResult = null;
      this.payload = null;
    }
  }
}

/**
 * Returns fetcher job
 * @param {object} fileContents file contents
 * @return {object|null}
 */
function generateFetcherJob(fileContents) {
  if (!fileContents.stats.d) {
    return {
      type: Fetcher.fetchTypesEnum.fetchPageCount,
      data: null,
    };
  }

  const pagesFetched = fileContents.pages;
  const pagesFetchedLength = pagesFetched.length;
  let articlesToFetch = [];

  for (let i = 0; i < pagesFetchedLength; i++) {
    articlesToFetch = pagesFetched[i].art
      .filter(hsh => !(fileContents.articles.find(a => a.hash === hsh).parsed));
    if (articlesToFetch.length) {
      break;
    }
  }

  const {pagesCount} = fileContents.stats;

  if (articlesToFetch.length) {
    return {
      type: Fetcher.fetchTypesEnum.fetchArticle,
      data: {
        articleId: articlesToFetch[0],
      },
    };
  } else if (pagesFetchedLength < pagesCount) {
    const pageNum = fileContents.options.pagination.reversed
      ? pagesCount - pagesFetchedLength
      : pagesFetchedLength + 1;
    return {
      type: Fetcher.fetchTypesEnum.fetchPageLinks,
      data: {
        pageNum,
      },
    };
  }

  return null;
}

module.exports = {
  generateFetcherJob,
  Fetcher,
};
