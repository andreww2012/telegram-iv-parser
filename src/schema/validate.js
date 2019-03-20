const Ajv = require('ajv');
const draft06MetaSchema = require('ajv/lib/refs/json-schema-draft-06.json');

const ajv = new Ajv();
ajv.addMetaSchema(draft06MetaSchema);

const {siteSectionSchema} = require('./schema');

exports.validateSchema = ajv.compile(siteSectionSchema);
