const fs = require('fs');
const path = require('path');
const fancylog = require('fancy-log');
const config = require('../config');
const {readSite, addFile} = require('../fs');
const {ReportGenerator} = require('../report/ReportGenerator');

/**
 * Generates report(s)
 * @param {string|null} host name
 * @param {...string} sections site sections
 * @return {string} full path to the main report file
 */
function makeReport(host = null, ...sections) {
  fancylog.info(`Forming report [host=${host || 'ALL'}, section=${sections.length ? sections : 'ALL'}]...`);

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

  let hostsHtml = '<h1>All sites</h1><ul>';

  for (let i = 0; i < hosts.length; i++) {
    const hostName = hosts[i];

    hostsHtml += `<li><a href="${hostName}/index.html">${hostName}</a></li>`;
    let sectionsHtml = `<h1><a href="../">All sites</a> / ${hostName}</h1><ul>`;

    let siteSections = singleHost
      ? sections
      : fs.readdirSync(`${sitesDir}/${hostName}`);

    siteSections = [...new Set(
      siteSections.filter(ssName => ssName.endsWith('.json')),
    )];

    for (let j = 0; j < siteSections.length; j++) {
      const siteSectionName = siteSections[j].replace(/\.json$/i, '');

      const reportFileName = `report-${hostName}-${siteSectionName}.html`;

      sectionsHtml += `<li><a href="${reportFileName}">${siteSectionName}</a></li>`;

      const fileContents = readSite(hostName, siteSectionName);
      const reportGenerator = new ReportGenerator(fileContents);
      const {html} = reportGenerator.generate();

      addFile(
        `${reportsDir}/${hostName}`,
        reportFileName,
        html,
        true,
      );
    }

    sectionsHtml += '</ul>';
    addFile(`${reportsDir}/${hostName}`, 'index.html', sectionsHtml, true);
  }

  hostsHtml += '</ul>';
  addFile(reportsDir, 'index.html', hostsHtml, true);

  fancylog.info('Reports has been generated');

  return path.join(process.cwd(), reportsDir, 'index.html');
}

exports.makeReport = makeReport;
