const {handleGenerate} = require('./generate');
const {handleParse} = require('./parse');

module.exports = {
  generate: handleGenerate,
  parse: handleParse,
};
