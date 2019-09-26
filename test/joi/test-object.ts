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
    title: 'complicated example',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        credit_card: { type: 'number' },
        billing_address: { type: 'string' },
        username: {
          type: 'string',
          maxLength: 100
        }
      },
      required: ['name'],
      patternProperties: {
        '^S_': { type: 'string' },
        '^I_': { type: 'integer' }
      },
      additionalProperties: false,
      dependencies: {
        username: ['credit_card', 'billing_address', 'name'],
      }
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: { type: 'string', required: true },
        credit_card: { type: 'number' },
        billing_address: { type: 'string' },
        username: { type: 'string', max: 100 },
      },
      with: {
        username: ['credit_card', 'billing_address', 'name'],
      },
      pattern: [
        {
          pattern: '^S_',
          schema: { type: 'string' }
        },
        {
          pattern: '^I_',
          schema: { type: 'number', integer: true }
        }
      ],
      unknown: false
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  credit_card: Joi.number(),\n' +
      '  billing_address: Joi.string(),\n' +
      '  username: Joi.string().max(100),\n' +
      '}).pattern(/^S_/,Joi.string())\n' +
      '.pattern(/^I_/,Joi.number().integer())\n' +
      '.with(\'username\', [\'credit_card\',\'billing_address\',\'name\'] )\n' +
      '.unknown(false)'
  },
  {
    title: 'with property dependencies',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        credit_card: { type: 'number' },
        billing_address: { type: 'string' }
      },
      required: ['name'],
      dependencies: {
        credit_card: ['billing_address', 'name']
      }
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        name: { type: 'string', required: true },
        credit_card: { type: 'number' },
        billing_address: { type: 'string' }
      },
      with: {
        credit_card: ['billing_address', 'name']
      },
      unknown: true
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  credit_card: Joi.number(),\n' +
      '  billing_address: Joi.string(),\n' +
      '}).with(\'credit_card\', [\'billing_address\',\'name\'] )\n' +
      '.unknown()'
  },
  {
    title: 'pattern dependencies',
    schema: {
      type: 'object',
      properties: {
        builtin: { type: 'number' }
      },
      patternProperties: {
        '^S_': { type: 'string' },
        '^I_': { type: 'integer' }
      },
      additionalProperties: { type: 'string' }
    },
    targetJoiSchema: {
      type: 'object',
      keys: { builtin: { type: 'number' } },
      pattern: [
        {
          pattern: '^',
          schema: { type: 'string' }
        },
        {
          pattern: '^S_',
          schema: { type: 'string' }
        },
        {
          pattern: '^I_',
          schema: { type: 'number', integer: true }
        }
      ]
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  builtin: Joi.number(),\n' +
      '}).pattern(/^/,Joi.string())\n' +
      '.pattern(/^S_/,Joi.string())\n' +
      '.pattern(/^I_/,Joi.number().integer())'
  },
  {
    title: 'length',
    schema: {
      type: 'object',
      minProperties: 3,
      maxProperties: 3
    },
    targetJoiSchema: {
      type: 'object',
      keys: undefined,
      unknown: true,
      length: 3
    },
    targetJoiString:
      'Joi.object().length(3).unknown()'
  },
  {
    title: 'properties',
    schema: {
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        address: { type: 'string' },
        telephone: { type: 'any' }
      },
      required: ['name', 'email']
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
      unknown: true,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  email: Joi.string().required(),\n' +
      '  address: Joi.string(),\n' +
      '  telephone: Joi.any(),\n' +
      '}).unknown()',
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
      unknown: false,
    },
    targetJoiString:
      'Joi.object().keys({\n' +
      '  name: Joi.string().required(),\n' +
      '  email: Joi.string().required(),\n' +
      '  address: Joi.string(),\n' +
      '  telephone: Joi.string(),\n' +
      '}).unknown(false)',
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
];

describe('joi object', () => {
  runTest(testItems, objectJSONSchemaTemplate, resolveJoiObjectSchema, generateObjectJoi, logger);
});
