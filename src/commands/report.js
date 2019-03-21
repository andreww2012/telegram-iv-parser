const {makeReport} = require('../report');

module.exports = {
  command: 'report [site]',
  aliases: ['stats', 'csv', 'info'],
  desc: 'Generates report',
  builder(yargs) {
    yargs
      .positional('site', {
        describe: `Generate report(s) only for a specific site.
          Formats: example.com, example.com@section1@seciton2`,
        type: 'string',
        default: '',
      })
      .option('infinite', {
        alias: 'i',
        describe: 'Generate report(s) periodically',
        type: 'boolean',
        default: false,
      })
      .option('per', {
        alias: 'p',
        describe: 'Generate report(s) every [per] minute(s), 1 minute at min',
        type: 'number',
        default: 5,
      });
  },

  handler({site, infinite, per}) {
    const [host = null, ...sections] = site.split('@');

    makeReport(host, ...sections);
    if (infinite) {
      const perMs = per * 60 * 1000;
      setInterval(
        makeReport.bind(this, host, ...sections),
        perMs,
      );
    }
  },
};
