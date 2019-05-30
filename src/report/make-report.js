const {exec} = require('child_process');
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');
const dateFns = require('date-fns');
const config = require('../config');
const {readSite, addFile} = require('../fs');
const {ReportGenerator} = require('../report/ReportGenerator');

const execAsync = promisify(exec);

/**
 * Generates report(s)
 * @param {string|null} host name
 * @param {array} sections site sections
 * @param {object} options list of options: noArchive
 * @return {string} full path to the main report file
 */
function makeReport(host = null, sections, {archive}) {
  if (!sections) {
    sections = [];
  }

  console.log(`Generating report(s) for
    host: ${host || 'all hosts'},
    sections: ${sections.length ? sections.join(', ') : 'all sections'}
  `);

  const {sitesDir, reportsDir, defaultDirName} = config.dirs;

  const allHosts = fs.readdirSync(sitesDir);

  const hosts = [...new Set(host ? [host] : allHosts)];

  const datetime = dateFns.format(new Date(), 'DD.MM.YYYY HH:mm:ss');

  let hostsHtml = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css"><style>a:visited{color: red !important;}a:focus{outline: 4px solid greenyellow !important;}</style><div class="container"><section class="section"><nav class="breadcrumb is-large"><ul><li>All sites</li></ul></nav><div class="content"><p><code>${datetime}</code></p><ul>`;

  allHosts.forEach(hostName => {
    hostsHtml += `<li><a href="${hostName}/index.html">${hostName}</a></li>`;
  });

  for (let i = 0; i < hosts.length; i++) {
    const hostName = hosts[i];

    let sectionsHtml = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css"><style>a:visited{color: red !important;}a:focus{outline: 4px solid greenyellow !important;}</style><div class="container"><section class="section"><nav class="breadcrumb is-large"><ul><li><a href="../index.html">All sites</a></li><li class="is-active"><a>${hostName}</a></li></ul></nav><div class="content"><p><code>${datetime}</code></p><ul>`;

    let siteSections = sections.length
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

      if (!fileContents) {
        console.log(`Omitting ${hostName}/${siteSectionName} because of the error...`);
        continue;
      }

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

  hostsHtml += '</ul><p><a href="../report.rar" class="button is-primary">Download all reports as an archive</a></p>';

  addFile(reportsDir, 'index.html', hostsHtml, true);

  console.log('Reports has been generated');

  if (archive) {
    console.log('Generating the archive (it may take a while)...');

    execAsync('WinRAR a -IBCK -isnd- report *\\**', {
      cwd: path.join(process.cwd(), defaultDirName),
      env: process.env,
      windowsHide: true,
    }).then(() => {
      console.log('RAR with all the data generated');
    }).catch(err => {
      console.log('Error during the archiving occured', err);
    });
  }

  return path.join(process.cwd(), reportsDir, 'index.html');
}

exports.makeReport = makeReport;
