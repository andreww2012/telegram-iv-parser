const opn = require('opn');
const fancylog = require('fancy-log');
const {makeReport} = require('../report');

module.exports = {
  command: 'report [site]',
  aliases: ['r'],
  desc: 'Generates report(s) for specified sites (for all sites every minute by default)',
  builder(yargs) {
    yargs
      .positional('site', {
        describe: `Generate report(s) only for a specific site.
          Formats: example.com, example.com@section1@seciton2`,
        type: 'string',
        default: '',
      })
      .option('per', {
        alias: 'p',
        describe: 'Generate report(s) every [per] minute(s), 1 minute at min',
        type: 'number',
        default: 1,
      })
      .option('noopen', {
        alias: 'no',
        describe: 'Do not open a browser with the report',
        type: 'boolean',
        default: false,
      })
      .option('noar', {
        alias: 'na',
        describe: 'Do not generate an archive',
        type: 'boolean',
        default: false,
      });
  },

  handler({site, per, noopen: noOpen, noar: noArchive}) {
    const [host = null, ...sections] = site.split('@');

    if (per) {
      fancylog.info(`Report will be generated every ${per} minutes`);
      fancylog.info(`Browser will be opened: ${!noOpen}`);
      fancylog.info(`Archive will be generated: ${!noArchive}`);
    }

    const reportPath = makeReport(host, sections, {noArchive});

    if (!noOpen) {
      fancylog.info('Opening your browser with the report...');
      opn(`file:///${reportPath}`, {app: 'firefox'});
    }

    if (per >= 1) {
      const perMs = per * 60 * 1000;
      setInterval(
        makeReport.bind(this, host, sections, {noArchive}),
        perMs,
      );
    }
  },
};
