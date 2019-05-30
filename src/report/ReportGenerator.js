const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const normalizeUrl = require('normalize-url');
const lodash = require('lodash');
const dateFns = require('date-fns');

/**
 * Report generator
 */
class ReportGenerator {
  /**
   * @param {any} fileContents file contents
   * @param {string} reportTemplatePath path to the handlebars report template
   */
  constructor(fileContents, reportTemplatePath = 'report.hbs') {
    this.fileContents = fileContents;
    this.reportTemplatePath = reportTemplatePath;
  }

  /**
   * @public
   * @return {any}
   */
  generate() {
    const reportTemplate = handlebars.compile(fs.readFileSync(
      // eslint-disable-next-line no-undef
      path.join(__dirname, this.reportTemplatePath),
      {encoding: 'utf8'},
    ));

    const {fileContents} = this;
    const {host, name, subdomain, httpOnly} = fileContents.options;
    const {parsingResults} = fileContents;

    const currDate = new Date();

    const dayFormatted = dateFns.format(currDate, 'DD-MM-YYYY');
    const timeFormatted = dateFns.format(currDate, 'HH-mm-ss');

    // eslint-disable-next-line prefer-const
    let reportTemplateContext = {
      host,
      subdomain,
      sectionName: name,
      date: {
        rawDate: currDate.toISOString(),
        dayFormatted,
        timeFormatted,
      },
      data: {},
    };

    parsingResults.forEach(r => r.articleHash = r.art[0]);

    const linksByCategory = {};

    [...new Set(parsingResults.map(r => r.cat))]
      .forEach(cat => linksByCategory[cat] = []);

    lodash.remove(parsingResults, elem => {
      const toRemove = linksByCategory[elem.cat].includes(elem.articleHash);
      linksByCategory[elem.cat].push(elem.articleHash);
      return toRemove;
    });

    parsingResults.filter(r => r.articleHash).forEach(result => {
      result.art = result.art.slice(1, 21).map(artHash => {
        const articleInfo = fileContents.articles
          .find(a => a.hash === artHash);
        return normalizeUrl(
          `http${httpOnly ? '' : 's'}://${subdomain ? subdomain + '.' : ''}${host}/${articleInfo.url}`,
          {stripWWW: false, removeTrailingSlash: false},
        );
      });

      const articleInfo = fileContents.articles
        .find(a => a.hash === result.articleHash);
      const fullArticleUrl = normalizeUrl(
        `http${httpOnly ? '' : 's'}://${subdomain ? subdomain + '.' : ''}${host}/${articleInfo.url}`,
        {stripWWW: false, removeTrailingSlash: false},
      );
      result.articleInfo = articleInfo;
      result.articleUrl = fullArticleUrl;

      const {cat: category} = result;

      if (!reportTemplateContext.data[category]) {
        reportTemplateContext.data[category] = [result];
      } else {
        reportTemplateContext.data[category].push(result);
      }
    });

    return {
      context: reportTemplateContext,
      html: reportTemplate(reportTemplateContext),
    };
  }
}

exports.ReportGenerator = ReportGenerator;
