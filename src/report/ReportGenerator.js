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
      path.join(__dirname, this.reportTemplatePath),
      {encoding: 'utf8'},
    ));

    const {fileContents} = this;
    const {host, name} = fileContents.options;
    const {parsingResults} = fileContents;

    const currDate = new Date();

    const dayFormatted = dateFns.format(currDate, 'DD-MM-YYYY');
    const timeFormatted = dateFns.format(currDate, 'HH-mm-ss');

    // eslint-disable-next-line prefer-const
    let reportTemplateContext = {
      host,
      sectionName: name,
      day: dayFormatted,
      time: timeFormatted,
      data: {},
    };

    Object.keys(parsingResults).forEach(key => {
      let currParsingResults = parsingResults[key];

      currParsingResults.forEach(result => {
        result.article = result.articles[0];
        delete result.articles;
        let fullArticleUrl = '-';
        if (result.article) {
          const articleRelativeUrl = fileContents.articles
            .find(a => a.hash === result.article)
            .url;
          fullArticleUrl = normalizeUrl(`${host}/${articleRelativeUrl}`);
        }
        result.article = fullArticleUrl;
      });

      currParsingResults = lodash.uniqBy(
        currParsingResults,
        'article',
      );

      reportTemplateContext.data[key] = currParsingResults;
    });

    return {
      context: reportTemplateContext,
      html: reportTemplate(reportTemplateContext),
    };
  }
}

exports.ReportGenerator = ReportGenerator;
