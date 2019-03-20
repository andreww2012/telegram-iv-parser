const path = require('path');
const {Parser} = require('../parser');

module.exports = ({filename, period}) => {
  let filePath = path.normalize(filename);

  if (!filename.endsWith('.json')) {
    filePath = `${filePath}.json`;
  }

  new Parser(filePath, period).startParsingLoop();
};
