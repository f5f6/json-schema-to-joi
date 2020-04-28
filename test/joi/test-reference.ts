// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { resolveJSONSchema, generateJoiStatement, SubSchemas, formatJoi } from '../../src/joi';
import { createLogger } from '../../src/common/logger';
import { runTest, TestItem, expect } from './common';
import { resolveBundledJSONSchema } from '../../src/joi/resolve';
import { JoiStatement } from '../../src/joi/generate';

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

const bundledSchema: JSONSchema4 = {
  definitions: {
    address: {
      type: 'object',
      properties: {
        street_address: { type: 'string' },
        city: { type: 'string' },
        state: { type: 'string' }
      },
      required: ['street_address', 'city', 'state']
    },
    billing_address: { $ref: '#/definitions/address' },
    shipping_address: { $ref: '#/definitions/address' },
    complicatedAddress: {
      type: 'object',
      properties: {
        addressTypeA: {
          $ref: '#/definitions/billing_address'
        },
        addressTypeB: {
          $ref: '#/definitions/complicatedAddress'
        },
      },
      required: ['addressTypeA'],
    }
  },
};

const bundledJoiString =
  `const addressJoiSchema = Joi.object()
  .keys({
    street_address: Joi.string()
      .min(0)
      .allow(...[''])
      .required(),
    city: Joi.string()
      .min(0)
      .allow(...[''])
      .required(),
    state: Joi.string()
      .min(0)
      .allow(...[''])
      .required(),
  })
  .unknown();
const billing_addressJoiSchema = addressJoiSchema;
const shipping_addressJoiSchema = addressJoiSchema;
const complicatedAddressJoiSchema = Joi.object()
  .keys({
    addressTypeA: billing_addressJoiSchema.required(),
    addressTypeB: complicatedAddressJoiSchema,
  })
  .unknown();`;

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
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, { rootSchema, deRefer: true });
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, { subSchemas, deRefer: true });
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, {
    rootSchema, useDeprecatedJoi: true, deRefer: true
  });
  runTest(testItems, resolveJSONSchema, generateJoiStatement, logger, {
    subSchemas, useDeprecatedJoi: true, deRefer: true
  });
  it('resolveBundledJSONSchema', () => {
    const a = resolveBundledJSONSchema(bundledSchema);
    const total: JoiStatement[] = [];
    a.forEach((b) => {
      const c = generateJoiStatement(b, true);
      total.push(...c);
      total.push(';');
    });

    const d = formatJoi(total, { prettierOptions: { semi: true } });
    expect(d).to.be.equal(bundledJoiString);

  });
});
