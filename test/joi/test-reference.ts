// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { resolveJSONSchema, generateJoi, SubSchemas } from '../../src/joi';
import { createLogger } from '../../src/common/logger';
import { runTest, TestItem } from './common';

const logger = createLogger('test-reference');

const rootSchema: JSONSchema4 = {
  definitions: {
    address: {
      type: 'object',
      properties: {
        street_address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' }
      },
      required: ['street_address', 'city', 'state']
    }
  },
};

const subSchemas: SubSchemas = {
  root: rootSchema,
};

const testItems: TestItem[] = [
  {
    title: 'ref',
    schema: {
      type: 'object',
      properties: {
        billing_address: { $ref: 'root#/definitions/address' },
        shipping_address: { $ref: 'root#/definitions/address' }
      }
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        billing_address: {
          type: 'object',
          keys: {
            street_address: {
              type: 'string',
              min: 0,
              allow: [''],
              required: true
            },
            city: {
              type: 'string',
              min: 0,
              allow: [''],
              required: true
            },
            state: {
              type: 'string',
              min: 0,
              allow: [''],
              required: true
            }
          },
          unknown: true
        },
        shipping_address: {
          type: 'object',
          keys: {
            street_address: {
              type: 'string',
              min: 0,
              allow: [''],
              required: true
            },
            city: {
              type: 'string',
              min: 0,
              allow: [''],
              required: true
            },
            state: {
              type: 'string',
              min: 0,
              allow: [''],
              required: true
            }
          },
          unknown: true
        }
      },
      unknown: true
    },
    targetJoiString: '' +
      'Joi.object().keys({\n' +
      '  billing_address: Joi.object().keys({\n' +
      '    street_address: Joi.string().min(0).allow(...[\'\']).required(),\n' +
      '    city: Joi.string().min(0).allow(...[\'\']).required(),\n' +
      '    state: Joi.string().min(0).allow(...[\'\']).required(),\n' +
      '  }).unknown(),\n' +
      '  shipping_address: Joi.object().keys({\n' +
      '    street_address: Joi.string().min(0).allow(...[\'\']).required(),\n' +
      '    city: Joi.string().min(0).allow(...[\'\']).required(),\n' +
      '    state: Joi.string().min(0).allow(...[\'\']).required(),\n' +
      '  }).unknown(),\n' +
      '}).unknown()',
  },
];

describe('test reference', () => {
  runTest(testItems, resolveJSONSchema, generateJoi, logger, { rootSchema, });
  runTest(testItems, resolveJSONSchema, generateJoi, logger, { subSchemas, });
  runTest(testItems, resolveJSONSchema, generateJoi, logger, { rootSchema, useDeprecatedJoi: true, });
  runTest(testItems, resolveJSONSchema, generateJoi, logger, { subSchemas, useDeprecatedJoi: true, });
});
