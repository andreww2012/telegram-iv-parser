const jsonfile = require('jsonfile');
const chalk = require('chalk');
const nanoid = require('nanoid');
const {Fetcher, generateFetcherJob} = require('./Fetcher');
const {validateSchema} = require('../schema');

/**
 * Parser
 */
class Parser {
  /**
   * Synchronously opens a file and synchronously reads it
   * @param {string} filePath file name
   * @param {number} period fetch frequency in ms (default: 0)
   */
  constructor(filePath, period) {
    this.period = +period || 0;
    this.filePath = filePath;
    this.fileContents = jsonfile.readFileSync(this.filePath);
    if (!validateSchema(this.fileContents)) {
      throw new Error(
        chalk.red('[error]'),
        'File structure does not match the schema',
      );
    }
  }

  /**
   * @private
   * Rewrites file contents
   */
  rewriteFile() {
    jsonfile.writeFileSync(this.filePath, this.fileContents);
    jsonfile.readFileSync(this.filePath);
  }

  /**
   * Processes fetch result
   * @param {any}  fetcherJob fetcher job descriptor
   * @param {Fetcher} fetcherInstance fetcher instance
   */
  async processFetchResult(fetcherJob, fetcherInstance) {
    const jobData = fetcherJob.data;
    const {payload} = fetcherInstance;
    const {fileContents} = this;

    if (fetcherJob.type === Fetcher.fetchTypesEnum.fetchPageCount) {
      fileContents.stats.pagesCount = fetcherInstance.payload.count;
      fileContents.stats.d = new Date().getTime();
    }

    if (fetcherJob.type === Fetcher.fetchTypesEnum.fetchPageLinks) {
      const {pageNum} = jobData;
      const {parsedUrls, pageWithoutLinks} = payload;
      if (pageWithoutLinks) {
        fileContents.stats.pagesCount = pageNum - 1;
      } else {
        const articlesFullInfo = parsedUrls.map(url => ({
          hash: nanoid(12),
          url,
          fromPage: pageNum,
          code: fetcherInstance.fetchResult.status,
          d: 0,
          parsed: false,
          checked: false,
        }));

        const articleHashes = articlesFullInfo.map(({hash}) => hash);

        fileContents.pages.push({
          num: pageNum,
          art: articleHashes,
          d: new Date().getTime(),
        });
        fileContents.articles.push(...articlesFullInfo);
      }
    }

    if (fetcherJob.type === Fetcher.fetchTypesEnum.fetchArticle) {
      const {articleId} = jobData;
      const {tags, attrs, classes, unsupported} = payload;

      const articleInfo = fileContents.articles.find(a => a.hash === articleId);

      articleInfo.d = new Date().getTime();
      articleInfo.parsed = true;

      const {parsingResults: pr} = fileContents;
      const existingTags = [
        ...new Set(pr.filter(r => r.cat === 'tag').map(t => t.name)),
      ];
      const existingClasses = [
        ...new Set(pr.filter(r => r.cat === 'class').map(t => t.name)),
      ];
      const existingAttrs = [
        ...new Set(pr.filter(r => r.cat === 'attr').map(t => t.name)),
      ];
      const existingUnsupported = [
        ...new Set(pr.filter(r => r.cat === 'unsupported').map(t => t.name)),
      ];

      tags.forEach(tagName => {
        if (existingTags.includes(tagName)) {
          const info = pr.find(t => t.cat === 'tag' && t.name === tagName);
          info.count = info.count + 1;
          info.art.push(articleId);
        } else {
          pr.push({
            cat: 'tag',
            info: {},
            name: tagName,
            count: 1,
            art: [articleId],
          });
        }
      });

      classes.forEach(className => {
        if (existingClasses.includes(className)) {
          const info = pr.find(t => t.cat === 'class' && t.name === className);
          info.count = info.count + 1;
          info.art.push(articleId);
        } else {
          pr.push({
            cat: 'class',
            info: {},
            name: className,
            count: 1,
            art: [articleId],
          });
        }
      });

      attrs.forEach(attrName => {
        if (existingAttrs.includes(attrName)) {
          const info = pr.find(t => t.cat === 'attr' && t.name === attrName);
          info.count = info.count + 1;
          info.art.push(articleId);
        } else {
          pr.push({
            cat: 'attr',
            info: {},
            name: attrName,
            count: 1,
            art: [articleId],
          });
        }
      });

      unsupported.forEach(unsuppName => {
        if (existingUnsupported.includes(unsuppName)) {
          const info = pr.find(t => t.cat === 'unsupported' && t.name === unsuppName);
          info.count = info.count + 1;
          info.art.push(articleId);
        } else {
          pr.push({
            cat: 'unsupported',
            info: {},
            name: unsuppName,
            count: 1,
            art: [articleId],
          });
        }
      });

      pr.sort((el1, el2) => el1.count - el2.count);
    }

    if (!validateSchema(this.fileContents)) {
      console.error(
        chalk.red('[schema break delected after a parsing iteration]'),
        validateSchema.errors,
      );
      throw new Error('Schema would be broken if parsing result is saved');
    }

    this.rewriteFile();
  }

  /**
   * @private
   * Performs a parsing loop iteration
   */
  async parse() {
    const fetcherJob = generateFetcherJob(this.fileContents);
    const fetcherJobStringified = JSON.stringify(fetcherJob);

    console.log(fetcherJob);

    if (fetcherJob) {
      console.info(chalk.yellowBright('[job starting]'), fetcherJobStringified);

      const fetcher = new Fetcher(fetcherJob, this.fileContents);

      await fetcher.fetch();

      if (!fetcher.fetchResult) {
        console.error(chalk.red('[error]'), 'Fetcher could not handle the given job', fetcherJobStringified);
      }

      if (fetcher.payload) {
        await this.processFetchResult(fetcherJob, fetcher);
        console.info(chalk.greenBright('[job done]'), fetcherJobStringified);
        setTimeout(this.parse.bind(this), this.period);
      } else {
        console.error(chalk.red('[job failed]'), fetcherJobStringified);
      }
    } else {
      // console.log(this.fileContents);
      // this.rewriteFile();
      console.info(chalk.greenBright('Nothing left to parse. Stopping the process'));
      process.exit(1);
    }
  }

  /**
   * @public
   * Starts parsing loop
   */
  startParsingLoop() {
    try {
      console.info(chalk.blue(`Parsing is starting, period=${this.period}`));
      this.parse();
    } catch (error) {
      console.error(chalk.red('An error occured during the parsing:'), error);
    }
  }
}

exports.Parser = Parser;
