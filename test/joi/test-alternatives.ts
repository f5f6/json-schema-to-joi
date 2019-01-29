// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createLogger, TestItem, runTest } from './common';
import { resolveJoiAlternativesSchema, generateAlternativesJoi } from '../../src/joi/alternatives';

const logger = createLogger('test-string');

// tslint:disable-next-line:naming-convention
const alternativesJSONSchemaTemplate: JSONSchema4 = {
};

const testItems: TestItem[] = [
  {
    title: 'not',
    schema: {
      not: {
        type: 'string'
      }
    },
    targetJoiSchema: {
      type: 'alternatives',
      not: {
        type: 'string',
      }
    },
    targetJoiString: '' +
      'Joi.alternatives().when(\n' +
      '  Joi.alternatives().try(Joi.string()), {\n' +
      '    then: Joi.any().forbidden(),\n' +
      '    otherwise: Joi.any(),\n' +
      '  })',
  },
  {
    title: 'anyOf',
    schema: {
      anyOf: [{
        type: 'string',
      }, {
        type: 'number',
      }]
    },
    targetJoiSchema: {
      type: 'alternatives',
      anyOf: [{
        type: 'string',
      }, {
        type: 'number',
      }],
    },
    targetJoiString: '' +
      'Joi.alternatives().try(\n' +
      '  Joi.string(),\n' +
      '  Joi.number(),\n' +
      ')',
  },
];

describe('joi alternatives', () => {
  runTest(testItems, alternativesJSONSchemaTemplate, resolveJoiAlternativesSchema, generateAlternativesJoi, logger);
});
