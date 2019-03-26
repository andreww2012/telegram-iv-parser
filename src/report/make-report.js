const {exec} = require('child_process');
const {promisify} = require('util');
const fs = require('fs');
const path = require('path');
const fancylog = require('fancy-log');
// const archiver = require('archiver');
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
function makeReport(host = null, sections, {noArchive}) {
  fancylog.info(`Forming report for host=${host || 'ALL'}, section=${sections.length ? sections : 'ALL'}`);

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

  let hostsHtml = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css"><style>a:visited{color: red !important;}a:focus{outline: 4px solid greenyellow !important;}</style><div class="container"><section class="section"><nav class="breadcrumb is-large"><ul><li>All sites</li></ul></nav><div class="content"><p><code>${datetime}</code></p><ul>`;

  for (let i = 0; i < hosts.length; i++) {
    const hostName = hosts[i];

    hostsHtml += `<li><a href="${hostName}/index.html">${hostName}</a></li>`;
    let sectionsHtml = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.4/css/bulma.min.css"><style>a:visited{color: red !important;}a:focus{outline: 4px solid greenyellow !important;}</style><div class="container"><section class="section"><nav class="breadcrumb is-large"><ul><li><a href="../index.html">All sites</a></li><li class="is-active"><a>${hostName}</a></li></ul></nav><div class="content"><p><code>${datetime}</code></p><ul>`;

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

      if (!fileContents) {
        fancylog.warn(`Omitting ${hostName}/${siteSectionName} because of the error...`);
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

  fancylog.info('Reports has been generated');


  if (!noArchive) {
    fancylog.info('Now generating the archive');

    execAsync('WinRAR a -IBCK -isnd- report *\\**', {
      cwd: path.join(process.cwd(), defaultDirName),
      env: process.env,
      windowsHide: true,
    }).then(() => {
      fancylog.info('RAR with all the data generated');
    }).catch(err => {
      fancylog.error('Error during the archiving occured', err);
    });
  }

  // const archive = archiver('zip');
  // const stream = fs.createWriteStream(`${defaultDirName}/${defaultDirName}.zip`);

  // archive
  //   .glob(`${defaultDirName}/**`, false)
  //   .on('error', err => console.error(err))
  //   .pipe(stream);

  // stream.on('close', () => {
  //   fancylog.info('ZIP with all the reports generated');
  // });
  // archive.finalize();

  // eslint-disable-next-line no-undef
  return path.join(process.cwd(), reportsDir, 'index.html');
}

exports.makeReport = makeReport;
