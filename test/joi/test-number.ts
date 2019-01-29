// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { resolveJoiNumberSchema, generateNumberJoi } from '../../src/joi/number';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-number');

// tslint:disable-next-line:naming-convention
const numberJSONSchemaTemplate: JSONSchema4 = {
  type: 'number',
};

const testItems: TestItem[] = [
  {
    title: 'integer',
    schema: {
      type: 'integer',
    },
    targetJoiSchema: {
      type: 'number',
      integer: true,
    },
    targetJoiString: 'Joi.number().integer()',
  },
  {
    title: 'number',
    schema: {
      type: 'number',
    },
    targetJoiSchema: {
      type: 'number',
    },
    targetJoiString: 'Joi.number()',
  },
  {
    title: 'min max',
    schema: {
      minimum: 1,
      maximum: 3,
    },
    targetJoiSchema: {
      type: 'number',
      min: 1,
      max: 3,
    },
    targetJoiString: 'Joi.number().min(1).max(3)',
  },
  {
    title: 'greater less',
    schema: {
      type: 'number',
      minimum: 1,
      maximum: 3,
      exclusiveMinimum: true,
      exclusiveMaximum: true,
    },
    targetJoiSchema: {
      type: 'number',
      min: 1,
      max: 3,
      greater: 1,
      less: 3,
    },
    targetJoiString: 'Joi.number().greater(1).less(3)',
  },
  {
    title: 'enum',
    schema: {
      enum: [1, 3, 5],
    },
    targetJoiSchema: {
      type: 'number',
      valid: [1, 3, 5],
    },
    targetJoiString: 'Joi.number().valid([1,3,5])',
  },
];

describe('joi number', () => {
  runTest(testItems, numberJSONSchemaTemplate, resolveJoiNumberSchema, generateNumberJoi, logger);
});
