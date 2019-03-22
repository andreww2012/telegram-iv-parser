const opn = require('opn');
const fancylog = require('fancy-log');
const {makeReport} = require('../report');

module.exports = {
  command: 'report [site]',
  aliases: ['stats', 'csv', 'info'],
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
        alias: 'n',
        describe: 'Do not open a browser with the report',
        type: 'boolean',
        default: false,
      });
  },

  handler({site, per, noopen}) {
    const [host = null, ...sections] = site.split('@');

    const reportPath = makeReport(host, ...sections);

    if (!noopen) {
      fancylog.info('Opening your browser with the report...');
      opn(`file:///${reportPath}`, {app: 'firefox'});
    }

    if (per >= 1) {
      const perMs = per * 60 * 1000;
      setInterval(
        makeReport.bind(this, host, ...sections),
        perMs,
      );
    }
  },
};
