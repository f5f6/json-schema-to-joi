// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { generateJoiStatement, formatJoi } from '../../src/joi';
import { createLogger } from '../../src/common/logger';
import { expect } from './common';
import { resolveBundledJSONSchema } from '../../src/joi/resolve';
import { JoiStatement } from '../../src/joi/generate';

const logger = createLogger('test-reference');

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
        addressTypeC: {
          type: 'array',
          items: {
            $ref: '#/definitions/address/properties/city',
          },
        }
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
    addressTypeC: Joi.array().items(
      Joi.string()
        .min(0)
        .allow(...[\'\']),
    ),
  })
  .unknown();`;

describe('test reference', () => {
  it('resolveBundledJSONSchema', () => {
    const bundledJoiSchemas = resolveBundledJSONSchema(bundledSchema);
    const total: JoiStatement[] = [];
    bundledJoiSchemas.forEach((subJoiSchema) => {
      const joiStatements = generateJoiStatement(subJoiSchema, true);
      total.push(...joiStatements);
      total.push(';');
    });

    const joiString = formatJoi(total, {
      prettierOptions: {
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        trailingComma: 'all',
        parser: 'typescript',
        semi: true,
      }
    }).trim();
    expect(joiString).to.be.equal(bundledJoiString.trim());
    logger.debug({
      bundledSchema, bundledJoiSchemas,
      joiString, bundledJoiString,
    });
  });
});
