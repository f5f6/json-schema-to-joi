// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { resolveJoiArraySchema, generateArrayJoi } from '../../src/joi/array';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-array');

// tslint:disable-next-line:naming-convention
const stringJSONSchemaTemplate: JSONSchema4 = {
  type: 'array',
};

const testItems: TestItem[] = [
  {
    title: '1 item',
    schema: {
      items: {
        type: 'string'
      }
    },
    targetJoiSchema: {
      type: 'array',
      items: [{
        type: 'string',
      }],
    },
    targetJoiString: 'Joi.array().items(Joi.string())',
  },
  {
    title: 'ordered',
    schema: {
      items: [{
        type: 'string',
      }, {
        type: 'number',
      }],
    },
    targetJoiSchema: {
      type: 'array',
      ordered: [{
        type: 'string',
      }, {
        type: 'number',
      }],
    },
    targetJoiString: 'Joi.array().ordered(Joi.string(),\n  Joi.number())',
  },

  {
    title: 'ordered with additional item',
    schema: {
      items: [{
        type: 'string',
      }, {
        type: 'number',
      }],
      additionalItems: {
        type: 'boolean',
      }
    },
    targetJoiSchema: {
      type: 'array',
      ordered: [{
        type: 'string',
      }, {
        type: 'number',
      }],
      items: [{
        type: 'boolean'
      }]
    },
    targetJoiString: 'Joi.array().ordered(Joi.string(),\n  Joi.number()).items(Joi.boolean())',
  },
  {
    title: 'minItems and maxItems',
    schema: {
      minItems: 1,
      maxItems: 3,
    },
    targetJoiSchema: {
      type: 'array',
      min: 1,
      max: 3,
    },
    targetJoiString: 'Joi.array().min(1).max(3)',
  },
  {
    title: 'uniqueness',
    schema: {
      uniqueItems: true,
    },
    targetJoiSchema: {
      type: 'array',
      unique: true
    },
    targetJoiString: 'Joi.array().unique()',
  },
];

describe('joi array', () => {
  runTest(testItems, stringJSONSchemaTemplate, resolveJoiArraySchema, generateArrayJoi, logger);
});
