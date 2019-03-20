const {handleGenerate} = require('./generate');
const {handleParse} = require('./parse');
const {handle: handleReport} = require('./report');

module.exports = {
  handleGenerate,
  handleParse,
  handleReport,
};
