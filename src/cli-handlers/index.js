const {handleGenerate} = require('./generate');
const {handleParse} = require('./parse');
const {handleInterpret} = require('./interpret');

module.exports = {
  generate: handleGenerate,
  parse: handleParse,
  interpret: handleInterpret,
};
