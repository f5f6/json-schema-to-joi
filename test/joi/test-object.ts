// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { resolveJoiObjectSchema, generateObjectJoi } from '../../src/joi/object';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-string');
// tslint:disable-next-line:naming-convention
const objectJSONSchemaTemplate: JSONSchema4 = {
  type: 'object',
};

const testItems: TestItem[] = [
  {
    title: 'properties',
    schema: {
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
        telephone: { type: 'any' }
      },
      required: ['name', 'email'],
      minProperties: 2,
      maxProperties: 3,
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          required: true,
        },
        address: {
          type: 'string',
        },
        telephone: {
          type: 'any',
        },
      },
      min: 2,
      max: 3,
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  email: Joi.string().required(),\n' +
      '  address: Joi.string(),\n' +
      '  telephone: Joi.any(),\n' +
      '}).min(2).max(3).unknown()',
  },
  {
    title: 'properties, additionalProperties = false',
    schema: {
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
        telephone: { type: 'string' }
      },
      required: ['name', 'email'],
      minProperties: 3,
      maxProperties: 3,
      additionalProperties: false,
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          required: true,
        },
        address: {
          type: 'string',
        },
        telephone: {
          type: 'string',
        },
      },
      length: 3,
      unknown: false,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  email: Joi.string().required(),\n' +
      '  address: Joi.string(),\n' +
      '  telephone: Joi.string(),\n' +
      '}).length(3).unknown(false)',
  },
  {
    title: 'properties, additionalProperties = true',
    schema: {
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
        telephone: { type: 'string' }
      },
      required: ['name', 'email'],
      additionalProperties: true,
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'string',
          required: true,
        },
        email: {
          type: 'string',
          required: true,
        },
        address: {
          type: 'string',
        },
        telephone: {
          type: 'string',
        },
      },
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  email: Joi.string().required(),\n' +
      '  address: Joi.string(),\n' +
      '  telephone: Joi.string(),\n' +
      '}).unknown()',
  },
  {
    title: 'properties, required some properties but properties empty',
    schema: {
      required: ['name', 'email'],
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'any',
          required: true,
        },
        email: {
          type: 'any',
          required: true,
        },
      },
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.any().required(),\n' +
      '  email: Joi.any().required(),\n' +
      '}).unknown()',
  },
  {
    title: 'properties, required some properties but properties don\'t cover them',
    schema: {
      properties: {
        a: { type: 'integer' },
        b: { type: 'string' },
      },
      required: ['name', 'email'],
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'any',
          required: true,
        },
        email: {
          type: 'any',
          required: true,
        },
        a: { type: 'number', integer: true },
        b: { type: 'string' },
      },
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  a: Joi.number().integer(),\n' +
      '  b: Joi.string(),\n' +
      '  name: Joi.any().required(),\n' +
      '  email: Joi.any().required(),\n' +
      '}).unknown()',
  },
  {
    title: 'property dependencies',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        credit_card: { type: 'number' },
        billing_address: { type: 'string' }
      },
      required: ['name'],
      dependencies: {
        credit_card: ['billing_address']
      }
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'string',
          required: true,
        },
        credit_card: {
          type: 'number',
        },
        billing_address: { type: 'string' },
      },
      with: {
        credit_card: ['billing_address'],
      },
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  credit_card: Joi.number(),\n' +
      '  billing_address: Joi.string(),\n' +
      '}).with(\'credit_card\', [\'billing_address\']).unknown()',
  },
  {
    title: 'schema dependencies',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        credit_card: { type: 'number' },
      },
      required: ['name'],
      dependencies: {
        credit_card: {
          properties: {
            billing_address: { type: 'string' }
          },
          required: ['billing_address']
        }
      }
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'string',
          required: true,
        },
        credit_card: {
          type: 'number',
        },
        billing_address: { type: 'string' },
      },
      with: {
        credit_card: ['billing_address'],
      },
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  credit_card: Joi.number(),\n' +
      '  billing_address: Joi.string(),\n' +
      '}).with(\'credit_card\', [\'billing_address\']).unknown()',
  },
  {
    title: 'schema dependencies',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        credit_card: { type: 'number' },
        billing_address: { type: 'string' },
      },
      required: ['name'],
      dependencies: {
        credit_card: {
          required: ['billing_address']
        }
      }
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: {
          type: 'string',
          required: true,
        },
        credit_card: {
          type: 'number',
        },
        billing_address: { type: 'string' },
      },
      with: {
        credit_card: ['billing_address'],
      },
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  credit_card: Joi.number(),\n' +
      '  billing_address: Joi.string(),\n' +
      '}).with(\'credit_card\', [\'billing_address\']).unknown()',
  },
];

describe('joi object', () => {
  runTest(testItems, objectJSONSchemaTemplate, resolveJoiObjectSchema, generateObjectJoi, logger);
});
