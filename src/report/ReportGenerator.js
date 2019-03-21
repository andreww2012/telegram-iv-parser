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
    const {host, name} = fileContents.options;
    let {parsingResults} = fileContents;

    const currDate = new Date();

    const dayFormatted = dateFns.format(currDate, 'DD-MM-YYYY');
    const timeFormatted = dateFns.format(currDate, 'HH-mm-ss');

    // eslint-disable-next-line prefer-const
    let reportTemplateContext = {
      host,
      sectionName: name,
      date: {
        rawDate: currDate.toISOString(),
        dayFormatted,
        timeFormatted,
      },
      data: {},
    };

    parsingResults.forEach(r => r.article = r.art[0]);

    parsingResults = lodash.uniqBy(parsingResults, 'article');

    parsingResults.forEach(result => {
      delete result.art;
      let fullArticleUrl = '-';
      if (result.article) {
        const articleRelativeUrl = fileContents.articles
          .find(a => a.hash === result.article)
          .url;
        fullArticleUrl = normalizeUrl(`${host}/${articleRelativeUrl}`);
      }
      result.article = fullArticleUrl;

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
