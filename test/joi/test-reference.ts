// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { resolveJSONSchema, generateJoiStatement, SubSchemas } from '../../src/joi';
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
    targetJoiString:
      'Joi.object()\n' +
      '  .keys({\n' +
      '    billing_address: Joi.object()\n' +
      '      .keys({\n' +
      '        street_address: Joi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\'])\n' +
      '          .required(),\n' +
      '        city: Joi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\'])\n' +
      '          .required(),\n' +
      '        state: Joi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\'])\n' +
      '          .required(),\n' +
      '      })\n' +
      '      .unknown(),\n' +
      '    shipping_address: Joi.object()\n' +
      '      .keys({\n' +
      '        street_address: Joi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\'])\n' +
      '          .required(),\n' +
      '        city: Joi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\'])\n' +
      '          .required(),\n' +
      '        state: Joi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\'])\n' +
      '          .required(),\n' +
      '      })\n' +
      '      .unknown(),\n' +
      '  })\n' +
      '  .unknown()',
  },
];

describe('test reference', () => {
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, { rootSchema, });
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, { subSchemas, });
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, { rootSchema, useDeprecatedJoi: true, });
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, { subSchemas, useDeprecatedJoi: true, });
});
