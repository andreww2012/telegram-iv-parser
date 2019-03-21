const fs = require('fs');
const config = require('../config');
const {readSite, addFile} = require('../fs');
const {ReportGenerator} = require('../report/ReportGenerator');

/**
 * Generates report(s)
 * @param {string|null} host name
 * @param {...string} sections site sections
 */
function makeReport(host = null, ...sections) {
  console.log(`${new Date().toUTCString()} Forming report for host ${host || '[ALL]'}, section ${sections.length ? sections : '[ALL]'}`);
  const {sitesDir, reportsDir} = config.dirs;
  let hosts = [];
  let singleHost = false;

  if (host) {
    hosts = [host];
    singleHost = true;
  } else {
    hosts = fs.readdirSync(sitesDir);
  }

  hosts = [...new Set(hosts)];

  for (let i = 0; i < hosts.length; i++) {
    const hostName = hosts[i];

    let siteSections = singleHost
      ? sections
      : fs.readdirSync(`${sitesDir}/${hostName}`);

    siteSections = [...new Set(
      siteSections.filter(ssName => ssName.endsWith('.json')),
    )];

    for (let j = 0; j < siteSections.length; j++) {
      const siteSectionName = siteSections[j].replace(/\.json$/i, '');

      const fileContents = readSite(hostName, siteSectionName);

      const reportGenerator = new ReportGenerator(fileContents);

      const {context, html} = reportGenerator.generate();
      const {date} = context;

      addFile(
        `${reportsDir}/${hostName}/${date.dayFormatted}`,
        `report-${hostName}-${siteSectionName}.html`,
        html,
        true,
      );
    }
  }
}

exports.makeReport = makeReport;
