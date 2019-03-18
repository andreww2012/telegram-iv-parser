const fs = require('fs');
const {validateSiteSectionSchema} = require('../validators');

/**
 * Reads file synchronously and 'JSON.parse's it
 * @param {any} pathOrDescriptor path/file descriptor
 * @return {object} parsed file
 */
async function readFileAndValidate(pathOrDescriptor) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathOrDescriptor, (err, fileContents) => {
      if (err) {
        return reject(err);
      }

      const parsedFileContents = JSON.parse(fileContents);
      const isValid = validateSiteSectionSchema(parsedFileContents);

      if (!isValid) {
        return reject(new Error('Schema or file is invalid'));
      }

      resolve(parsedFileContents);
    });
  });
}

module.exports = {
  readFileAndValidate,
};
