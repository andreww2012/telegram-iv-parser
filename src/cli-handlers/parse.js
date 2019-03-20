const path = require('path');
const {Parser} = require('../parser');

exports.handleParse = ({filename, period}) => {
  let filePath = path.normalize(filename);

  if (!filename.endsWith('.json')) {
    filePath = `${filePath}.json`;
  }

  new Parser(filePath, period).startParsingLoop();
};
