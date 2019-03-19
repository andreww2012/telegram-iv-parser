const path = require('path');
const {Parser} = require('../parser');

exports.handleParse = ({filename}) => {
  let filePath = path.normalize(filename);

  if (!filename.endsWith('.json')) {
    filePath = `${filePath}.json`;
  }

  new Parser(filePath).startParsingLoop();
};
