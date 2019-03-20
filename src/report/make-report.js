const fs = require('fs');
const config = require('../config');
const {readSite, writeFile} = require('../fs');
const {ReportGenerator} = require('../report');

/**
 * Generates report(s)
 * @param {string|null} host name
 * @param {...string} sections site sections
 */
function makeReport(host = null, ...sections) {
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
      const siteSectionName = siteSections[j];

      const fileContents = readSite(hostName, siteSectionName);

      const reportGenerator = new ReportGenerator(fileContents);

      const {html} = reportGenerator.generate();

      writeFile(
        `${reportsDir}/${hostName}`,
        `report-${hostName}-${siteSectionName}`,
        html,
      );
    }
  }
}

exports.makeReport = makeReport;
