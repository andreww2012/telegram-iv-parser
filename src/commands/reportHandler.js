
const {makeReport} = require('../report');

exports.handle = ({site, infinite, per}) => {
  const [host = null, ...sections] = site.split('@');

  if (infinite) {
    const perMs = per * 60 * 1000;
    setTimeout(
      makeReport.bind(null, host, ...sections),
      perMs,
    );
  } else {
    makeReport(host, ...sections);
  }
};
