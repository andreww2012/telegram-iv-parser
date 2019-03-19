/* eslint-disable no-console */
const fs = require('fs');
const jsonfile = require('jsonfile');
const chalk = require('chalk');
const nanoid = require('nanoid');
const {Fetcher, generateFetcherJob} = require('./Fetcher');
const {validateSiteSectionSchema} = require('../validator');

/**
 * Parser
 */
class Parser {
  /**
   * Synchronously opens a file and synchronously reads it
   * @param {string} filePath file name
   */
  constructor(filePath) {
    this.fileDescriptor = fs.openSync(filePath, 'rs+');
    this.fileContents = jsonfile.readFileSync(this.fileDescriptor);
    if (!validateSiteSectionSchema(this.fileContents)) {
      throw new Error(
        chalk.red('[error]'),
        'File structure does not match the schema',
      );
    }
  }

  /**
   * @private
   * Closes opened file
   */
  closeFile() {
    fs.close(this.fileDescriptor);
  }

  /**
   * @private
   * Rewrites file contents
   */
  rewriteFile() {
    jsonfile.writeFileSync(this.fileDescriptor, this.fileContents);
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
      fileContents.stats.parsingDates.unshift(new Date().getTime());
    }

    if (fetcherJob.type === Fetcher.fetchTypesEnum.fetchPageLinks) {
      const {pageNum} = jobData;
      const {parsedUrls} = payload;
      const articles = parsedUrls.map(() => ({
        hash: nanoid(12),
        parsed: false,
      }));
      const articlesFullInfo = articles.map(({hash}, i) => ({
        hash,
        url: parsedUrls[i],
        fromPage: pageNum,
        code: fetcherInstance.fetchResult.status,
        parsingDates: [],
      }));

      fileContents.pages.push({
        num: pageNum,
        articles,
        parsingDates: [new Date().getTime()],
      });
      fileContents.articles.push(...articlesFullInfo);
    }

    if (fetcherJob.type === Fetcher.fetchTypesEnum.fetchArticle) {
      const {articleId} = jobData;
      const {tags, attrs, classes, unsupported} = payload;

      const articleInfo = fileContents.articles.find(a => a.hash === articleId);
      const {fromPage} = articleInfo;
      const pageInfo = this.fileContents.pages.find(p => +p.num === +fromPage);
      const articlePageInfo = pageInfo.articles.find(a => a.hash === articleId);

      const currTimestamp = new Date().getTime();

      // 1. Add article fetch timestamp
      articleInfo.parsingDates.unshift(currTimestamp);

      // 2. Same for the whole page
      pageInfo.parsingDates.unshift(currTimestamp);

      // 3. Mark article as parsed
      articlePageInfo.parsed = true;

      const {parsingResults: pr} = fileContents;
      const existingTags = [...new Set(pr.tags.map(t => t.name))];
      const existingClasses = [...new Set(pr.classes.map(t => t.name))];
      const existingAttrs = [...new Set(pr.attributes.map(t => t.name))];
      const existingUnsupported = [...new Set(pr.unsupported.map(t => t.name))];

      // 4. Add statistics
      tags.forEach(tagName => {
        if (existingTags.includes(tagName)) {
          const tagInfo = pr.tags.find(t => t.name === tagName);
          tagInfo.count = tagInfo.count + 1;
          tagInfo.articles.push(articleId);
        } else {
          pr.tags.push({
            name: tagName,
            count: 1,
            articles: [articleId],
          });
        }
      });

      classes.forEach(className => {
        if (existingClasses.includes(className)) {
          const classInfo = pr.classes.find(t => t.name === className);
          classInfo.count = classInfo.count + 1;
          classInfo.articles.push(articleId);
        } else {
          pr.classes.push({
            name: className,
            count: 1,
            articles: [articleId],
          });
        }
      });

      attrs.forEach(attrName => {
        if (existingAttrs.includes(attrName)) {
          const attrInfo = pr.attributes.find(t => t.name === attrName);
          attrInfo.count = attrInfo.count + 1;
          attrInfo.articles.push(articleId);
        } else {
          pr.attributes.push({
            name: attrName,
            count: 1,
            articles: [articleId],
          });
        }
      });

      unsupported.forEach(unsuppName => {
        if (existingUnsupported.includes(unsuppName)) {
          const unsuppInfo = pr.unsupported.find(t => t.name === unsuppName);
          unsuppInfo.count = unsuppInfo.count + 1;
          unsuppInfo.articles.push(articleId);
        } else {
          pr.unsupported.push({
            name: unsuppName,
            count: 1,
            articles: [articleId],
          });
        }
      });


      pr.tags.sort((el1, el2) => el1.count - el2.count);
      pr.classes.sort((el1, el2) => el1.count - el2.count);
      pr.attributes.sort((el1, el2) => el1.count - el2.count);
      pr.unsupported.sort((el1, el2) => el1.count - el2.count);
    }

    if (!validateSiteSectionSchema(this.fileContents)) {
      console.error(
        chalk.red('[schema break delected after a parsing iteration]'),
        validateSiteSectionSchema.errors,
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
    console.log(chalk.blue('Starting parsing loop iteration'));

    const fetcherJob = generateFetcherJob(this.fileContents);
    const fetcherJobStringified = JSON.stringify(fetcherJob);

    if (fetcherJob) {
      console.log(chalk.yellowBright('[job starting]'), fetcherJobStringified);

      const fetcher = new Fetcher(fetcherJob, this.fileContents);

      await fetcher.fetch();

      if (!fetcher.fetchResult) {
        console.log(chalk.red('[error]'), 'Fetcher could not handle the given job', fetcherJobStringified);
        return this.closeFile();
      }

      if (fetcher.payload) {
        await this.processFetchResult(fetcherJob, fetcher);
        console.log(chalk.greenBright('[job done]'), fetcherJobStringified);
        setTimeout(this.parse.bind(this), 1000);
      } else {
        console.log(chalk.red('[job failed]'), fetcherJobStringified);
      }
    } else {
      console.log(chalk.greenBright('Nothing left to parse. Stopping the process'));
      this.closeFile();
    }
  }

  /**
   * @public
   * Starts parsing loop
   */
  startParsingLoop() {
    try {
      console.log(chalk.blue('Parsing is starting'));
      this.parse();
    } catch (error) {
      console.log(chalk.red('An error occured during the parsing:'), error);
    }
  }
}

exports.Parser = Parser;
