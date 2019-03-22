const fs = require('fs');
const path = require('path');
const fancylog = require('fancy-log');
const archiver = require('archiver');
const dateFns = require('date-fns');
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

  const {sitesDir, reportsDir, defaultDirName} = config.dirs;
  let hosts = [];
  let singleHost = false;

  if (host) {
    hosts = [host];
    singleHost = true;
  } else {
    hosts = fs.readdirSync(sitesDir);
  }

  hosts = [...new Set(hosts)];

  const datetime = dateFns.format(new Date(), 'DD.MM.YYYY HH:mm:ss');

  let hostsHtml = `<h1>All sites</h1><p>${datetime}</p><h3><mark><a href="../reports.zip">Download reports in ZIP</a></mark></h3><ul>`;

  for (let i = 0; i < hosts.length; i++) {
    const hostName = hosts[i];

    hostsHtml += `<li><a href="${hostName}/index.html">${hostName}</a></li>`;
    let sectionsHtml = `<h1><a href="../index.html">All sites</a> / ${hostName}</h1><p>${datetime}</p><ul>`;

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

  const archive = archiver('zip');
  const stream = fs.createWriteStream(`${defaultDirName}/reports.zip`);

  archive
    .directory(reportsDir, false)
    .on('error', err => console.error(err))
    .pipe(stream);

  stream.on('close', () => {
    fancylog.info('ZIP with all the reports generated');
  });
  archive.finalize();

  return path.join(process.cwd(), reportsDir, 'index.html');
}

exports.makeReport = makeReport;
