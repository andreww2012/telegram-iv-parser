const opn = require('opn');
const fancylog = require('fancy-log');
const {makeReport} = require('../report');

module.exports = {
  command: 'report [site]',
  aliases: ['r'],
  desc: 'Generates report(s) for specified sites',
  builder(yargs) {
    yargs
      .positional('site', {
        describe: `Generate report(s) only for specific sites.
          Formats: example1.com example2.com@section1@seciton2 example3`,
        type: 'string',
        default: '',
      })
      .option('per', {
        alias: 'p',
        describe: 'Generate report(s) every [per] minute(s), 1 minute at min (default: every 2 minutes)',
        type: 'number',
        default: 2,
      })
      .option('open', {
        alias: 'o',
        describe: 'Open a browser with the report after the generation',
        type: 'boolean',
        default: false,
      })
      .option('archive', {
        alias: 'a',
        describe: 'Generate the archive after the first report generation',
        type: 'boolean',
        default: false,
      });
  },

  handler({site, per, open, archive}) {
    const hosts = site.split(' ').filter(s => s);

    if (per) {
      console.log(`Report will be generated every ${per} minutes`);
      console.log(`Browser will be opened: ${open}`);
      console.log(`Archive will be generated: ${archive}`);
    }

    let reportPath;

    /**
     * Generates all the reports.
     */
    function generateReports() {
      if (hosts.length) {
        hosts.forEach(hostAndSections => {
          const [host, ...sections] = hostAndSections.split('@');
          reportPath = makeReport(host, sections, {archive});
        });
      } else {
        reportPath = makeReport(null, null, {archive});
      }
    }

    generateReports();

    if (open) {
      fancylog.info('Opening your browser with the report...');
      opn(`file:///${reportPath}`, {app: 'firefox'});
    }

    if (per >= 1) {
      const perMs = per * 60 * 1000;
      setInterval(generateReports, perMs);
    }
  },
};
