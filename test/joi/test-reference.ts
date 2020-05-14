// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { generateJoiStatement, formatJoi } from '../../src/joi';
import { createLogger } from '../../src/common/logger';
import { expect } from './common';
import { resolveBundledJSONSchema } from '../../src/joi/resolve';
import * as _ from 'lodash';
import { OpenAPIV3 } from 'openapi-types';

const logger = createLogger('test-reference');

// tslint:disable-next-line: naming-convention
const bundledSchemaOAS3: Partial<OpenAPIV3.Document> = {
  components: {
    schemas: {
      address: {
        type: 'object',
        properties: {
          street_address: { type: 'string' },
          city: { type: 'string' },
          state: { type: 'string' }
        },
        required: ['street_address', 'city', 'state']
      },
      billing_address: { $ref: '#/components/schemas/address' },
      shipping_address: { $ref: '#/components/schemas/address' },
      complicatedAddress: {
        type: 'object',
        properties: {
          addressTypeA: {
            $ref: '#/components/schemas/billing_address'
          },
          addressTypeB: {
            $ref: '#/components/schemas/complicatedAddress'
          },
          addressTypeC: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/address/properties/city',
            },
          },
          addressTypeD: {
            $ref: '#/components/schemas/address/properties/street_address',
          }
        },
        required: ['addressTypeA'],
      }
    },
  }
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
        addressTypeC: {
          type: 'array',
          items: {
            $ref: '#/definitions/address/properties/city',
          },
        },
        addressTypeD: {
          $ref: '#/definitions/address/properties/street_address',
        }
      },
      required: ['addressTypeA'],
    }
  },
};

const bundledJoiString =
  `const addressJoiSchema: Joi.ObjectSchema = Joi.object()
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
const billingAddressJoiSchema = addressJoiSchema;
const shippingAddressJoiSchema = addressJoiSchema;
const complicatedAddressJoiSchema: Joi.ObjectSchema = Joi.object()
  .keys({
    addressTypeA: billingAddressJoiSchema.required(),
    addressTypeB: Joi.link(\'#complicatedAddress\'),
    addressTypeC: Joi.array().items(
      Joi.string()
        .min(0)
        .allow(...[\'\']),
    ),
    addressTypeD: Joi.string()
      .min(0)
      .allow(...['']),
  })
  .unknown()
  .id(\'complicatedAddress\');`;

const bundledJoiStringLegacy =
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
const billingAddressJoiSchema = addressJoiSchema;
const shippingAddressJoiSchema = addressJoiSchema;
const complicatedAddressJoiSchema = Joi.object()
  .keys({
    addressTypeA: billingAddressJoiSchema.required(),
    addressTypeB: Joi.lazy(() => complicatedAddressJoiSchema),
    addressTypeC: Joi.array().items(
      Joi.string()
        .min(0)
        .allow(...[\'\']),
    ),
    addressTypeD: Joi.string()
      .min(0)
      .allow(...['']),
  })
  .unknown();`;

describe('test reference', () => {
  it('resolveBundledJSONSchema', () => {
    const bundledJoiSchemas = resolveBundledJSONSchema(bundledSchema.definitions!, { rootSchema: bundledSchema });
    const total = _.flattenDeep(bundledJoiSchemas.map(
      (subJoiSchema) => [generateJoiStatement(subJoiSchema, true), ';']));

    const joiString = formatJoi(total, {
      withTypeDeclaration: true,
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

  it('resolveBundledJSONSchema OAS3', () => {
    const bundledJoiSchemas = resolveBundledJSONSchema(
      bundledSchemaOAS3.components!.schemas!, { rootSchema: bundledSchemaOAS3 });
    const total = _.flattenDeep(bundledJoiSchemas.map(
      (subJoiSchema) => [generateJoiStatement(subJoiSchema, true), ';']));

    const joiString = formatJoi(total, {
      withTypeDeclaration: true,
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

  it('resolveBundledJSONSchema Legacy', () => {
    const bundledJoiSchemas = resolveBundledJSONSchema(
      bundledSchema.definitions!, { useDeprecatedJoi: true, rootSchema: bundledSchema });

    const total = _.flattenDeep(bundledJoiSchemas.map(
      (subJoiSchema) => [generateJoiStatement(subJoiSchema, true), ';']));

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
    expect(joiString).to.be.equal(bundledJoiStringLegacy.trim());
    logger.debug({
      bundledSchema, bundledJoiSchemas,
      joiString, bundledJoiString,
    });
  });

  it('resolveBundledJSONSchema OAS3 Legacy', () => {
    const bundledJoiSchemas = resolveBundledJSONSchema(
      bundledSchemaOAS3.components!.schemas!, { useDeprecatedJoi: true, rootSchema: bundledSchemaOAS3 });

    const total = _.flattenDeep(bundledJoiSchemas.map(
      (subJoiSchema) => [generateJoiStatement(subJoiSchema, true), ';']));

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
    expect(joiString).to.be.equal(bundledJoiStringLegacy.trim());
    logger.debug({
      bundledSchema, bundledJoiSchemas,
      joiString, bundledJoiString,
    });
  });
});
