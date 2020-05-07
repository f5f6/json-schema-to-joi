import { resolveJoiObjectSchema, generateObjectJoi } from '../../src/joi/object';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-object');

const testItems: TestItem[] = [{
  title: 'object',
  schema: { type: 'object' },
  targetJoiSchema: { type: 'object', unknown: true, keys: undefined },
  targetJoiString: 'Joi.object().unknown()',
  joiUnitTests: [{
    target: { key: 'value', another_key: 'another_value' },
    valid: true,
  }, {
    target: {
      Sun: 1.9891e30, Jupiter: 1.8986e27,
      Saturn: 5.6846e26, Neptune: 10.243e25,
      Uranus: 8.6810e25, Earth: 5.9736e24,
      Venus: 4.8685e24, Mars: 6.4185e23,
      Mercury: 3.3022e23, Moon: 7.349e22,
      Pluto: 1.25e22,
    },
    valid: true,
  }, {
    target: 'Not an object',
    valid: false,
  }, {
    target: ['An', 'array', 'not', 'an', 'object'],
    valid: false,
  }]
}, {
  title: 'properties',
  schema: {
    type: 'object',
    properties: {
      number: { type: 'number' },
      street_name: { type: 'string' },
      street_type: { type: 'string', enum: ['Street', 'Avenue', 'Boulevard'] }
    }
  },
  targetJoiSchema: {
    type: 'object',
    unknown: true,
    keys: {
      number: { type: 'number', },
      street_name: { type: 'string', min: 0, allow: [''] },
      street_type: { type: 'string', valid: ['Street', 'Avenue', 'Boulevard'] },
    }
  },
  targetJoiString:
    'Joi.object()\n  .keys({\n    number: Joi.number(),\n    street_name: Joi.string()\n      .min(0)\n' +
    '      .allow(...[\'\']),\n    street_type: Joi.string().valid(...[\'Street\', \'Avenue\', \'Boulevard\']),\n' +
    '  })\n  .unknown()',
  joiUnitTests: [{
    target: { number: 1600, street_name: 'Pennsylvania', street_type: 'Avenue' },
    valid: true,
  }, {
    target: { number: '1600', street_name: 'Pennsylvania', street_type: 'Avenue' },
    valid: false,
  }, {
    target: { number: 1600, street_name: 'Pennsylvania' },
    valid: true,
  }, {
    target: {},
    valid: true,
  }, {
    target: {
      number: 1600, street_name: 'Pennsylvania', street_type: 'Avenue', direction: 'NW'
    },
    valid: true,
  }],
}, {
  title: 'properties - additionalProperties = false',
  schema: {
    type: 'object',
    properties: {
      number: { type: 'number' },
      street_name: { type: 'string' },
      street_type: { type: 'string', enum: ['Street', 'Avenue', 'Boulevard'] }
    },
    additionalProperties: false,
  },
  targetJoiSchema: {
    type: 'object',
    unknown: false,
    keys: {
      number: { type: 'number', },
      street_name: { type: 'string', min: 0, allow: [''] },
      street_type: { type: 'string', valid: ['Street', 'Avenue', 'Boulevard'] },
    },
  },
  targetJoiString:
    'Joi.object()\n  .keys({\n    number: Joi.number(),\n    street_name: Joi.string()\n' +
    '      .min(0)\n      .allow(...[\'\']),\n    street_type: Joi.string().valid(...[\'Street\', \'Avenue\', \'Boulevard\']),\n' +
    '  })\n  .unknown(false)',
  joiUnitTests: [{
    target: { number: 1600, street_name: 'Pennsylvania', street_type: 'Avenue' },
    valid: true,
  }, {
    target: { number: '1600', street_name: 'Pennsylvania', street_type: 'Avenue' },
    valid: false,
  }, {
    target: { number: 1600, street_name: 'Pennsylvania' },
    valid: true,
  }, {
    target: {},
    valid: true,
  }, {
    target: { number: 1600, street_name: 'Pennsylvania', street_type: 'Avenue', direction: 'NW' },
    valid: false,
  }],
}, {
  title: 'Required Properties',
  schema: {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string' },
      address: { type: 'string' },
      telephone: { type: 'string' }
    },
    required: ['name', 'email']
  },
  targetJoiSchema: {
    type: 'object',
    keys: {
      name: { type: 'string', min: 0, allow: [''], required: true, },
      email: { type: 'string', min: 0, allow: [''], required: true, },
      address: { type: 'string', min: 0, allow: [''] },
      telephone: { type: 'string', min: 0, allow: [''] },
    },
    unknown: true,
  },
  targetJoiString:
    'Joi.object()\n  .keys({\n' +
    '    name: Joi.string()\n      .min(0)\n      .allow(...[\'\'])\n      .required(),\n' +
    '    email: Joi.string()\n      .min(0)\n      .allow(...[\'\'])\n      .required(),\n' +
    '    address: Joi.string()\n      .min(0)\n      .allow(...[\'\']),\n' +
    '    telephone: Joi.string()\n      .min(0)\n      .allow(...[\'\']),\n  })\n  .unknown()',
  joiUnitTests: [{
    target: { name: 'William Shakespeare', email: 'bill@stratford-upon-avon.co.uk' }, valid: true,
  }, {
    target: {
      name: 'William Shakespeare', email: 'bill@stratford-upon-avon.co.uk',
      address: 'Henley Street, Stratford-upon-Avon, Warwickshire, England', authorship: 'in question'
    },
    valid: true,
  }, {
    target: {
      name: 'William Shakespeare', address: 'Henley Street, Stratford-upon-Avon, Warwickshire, England',
    },
    valid: false,
  }]
}, {
  title: 'Size',
  schema: {
    type: 'object', minProperties: 2, maxProperties: 3,
  },
  targetJoiSchema: {
    type: 'object',
    keys: undefined,
    min: 2,
    max: 3,
    unknown: true,
  },
  targetJoiString:
    'Joi.object()\n  .min(2)\n  .max(3)\n  .unknown()',
  joiUnitTests: [{
    target: {}, valid: false,
  }, {
    target: { a: 0 }, valid: false,
  }, {
    target: { a: 0, b: 1 }, valid: true,
  }, {
    target: { a: 0, b: 1, c: 2 }, valid: true,
  }, {
    target: { a: 0, b: 1, c: 2, d: 3 }, valid: false,
  }]
}, {
  title: 'properties, required some properties but properties empty',
  schema: {
    required: ['name', 'email'],
  },
  targetJoiSchema: {
    type: 'object',
    keys: {
      name: { type: 'any', required: true, },
      email: { type: 'any', required: true, },
    },
    unknown: true,
  },
  targetJoiString:
    'Joi.object()\n' +
    '  .keys({ name: Joi.any().required(), email: Joi.any().required() })\n' +
    '  .unknown()',
}, {
  title: 'properties, required some properties but properties don\'t cover them',
  schema: {
    properties: {
      a: { type: 'integer' }, b: { type: 'string' },
    },
    required: ['name', 'email'],
  },
  targetJoiSchema: {
    type: 'object',
    keys: {
      name: { type: 'any', required: true, },
      email: { type: 'any', required: true, },
      a: { type: 'number', integer: true },
      b: { type: 'string', min: 0, allow: [''] },
    },
    unknown: true,
  },
  targetJoiString:
    'Joi.object()  .keys({\n' +
    '    a: Joi.number().integer(),\n' +
    '    b: Joi.string()\n      .min(0)\n      .allow(...[\'\']),\n' +
    '    name: Joi.any().required(),\n' +
    '    email: Joi.any().required(),\n' +
    '  })\n  .unknown()',
}, {
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
        min: 0,
        allow: [''],
        required: true,
      },
      credit_card: { type: 'number', },
      billing_address: { type: 'string', min: 0, allow: [''] },
    },
    with: { credit_card: ['billing_address'], },
    unknown: true,
  },
  targetJoiString:
    'Joi.object()\n' +
    '  .keys({\n' +
    '    name: Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\'])\n' +
    '      .required(),\n' +
    '    credit_card: Joi.number(),\n' +
    '    billing_address: Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\']),\n' +
    '  })\n' +
    '  .with(\'credit_card\', [\'billing_address\'])\n' +
    '  .unknown()',
  joiUnitTests: [{
    target: { name: '1600', street_name: 'Pennsylvania', street_type: 'Avenue' },
    valid: true,
  }]
}, {
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
        properties: { billing_address: { type: 'string' } },
        required: ['billing_address']
      }
    }
  },
  targetJoiSchema: {
    type: 'object',
    keys: {
      name: {
        type: 'string',
        min: 0,
        allow: [''],
        required: true,
      },
      credit_card: { type: 'number', },
      billing_address: { type: 'string', min: 0, allow: [''] },
    },
    with: {
      credit_card: ['billing_address'],
    },
    unknown: true,
  },
  targetJoiString:
    'Joi.object()\n' +
    '  .keys({\n' +
    '    name: Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\'])\n' +
    '      .required(),\n' +
    '    credit_card: Joi.number(),\n' +
    '    billing_address: Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\']),\n' +
    '  })\n' +
    '  .with(\'credit_card\', [\'billing_address\'])\n' +
    '  .unknown()',
  joiUnitTests: [{
    target: {
      name: 'John Doe',
      credit_card: 5555555555555555,
      billing_address: '555 Debtor\'s Lane'
    },
    valid: true,
  }, {
    target: {
      name: 'John Doe',
      credit_card: 5555555555555555
    },
    valid: false,
  }, {
    target: {
      name: 'John Doe',
      billing_address: '555 Debtor\'s Lane'
    },
    valid: true,
  }]
}, {
  title: 'pattern properties',
  schema: {
    type: 'object',
    properties: {
      builtin: { type: 'number' }
    },
    patternProperties: {
      '^S_': { type: 'string' },
      '^I_': { type: 'integer' }
    },
    additionalProperties: false
  },
  targetJoiSchema: {
    type: 'object',
    keys: {
      builtin: { type: 'number' }
    },
    patterns: [{
      targetPattern: '^S_',
      schema: {
        type: 'string',
        min: 0,
        allow: ['']
      }
    }, {
      targetPattern: '^I_',
      schema: {
        type: 'number',
        integer: true
      }
    }],
    unknown: false,
  },
  targetJoiString:
    'Joi.object()\n' +
    '  .keys({ builtin: Joi.number() })\n' +
    '  .pattern(\n' +
    '    /^S_/,\n' +
    '    Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\']),\n' +
    '  )\n' +
    '  .pattern(/^I_/, Joi.number().integer())\n' +
    '  .unknown(false)',
  joiUnitTests: [{
    target: { S_0: 42 }, valid: false,
  }, {
    target: { I_42: 'This is a string' }, valid: false,
  }, {
    target: { keyword: 'value' }, valid: false,
  }, {
    target: { S_25: 'This is a string' }, valid: true,
  }, {
    target: { I_0: 42 }, valid: true,
  }]
}, {
  title: 'pattern properties with additionalProperties',
  skipLegacy: true,
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
    keys: {
      builtin: {
        type: 'number'
      }
    },
    patterns: [{
      targetPattern: '^S_',
      schema: {
        type: 'string',
        min: 0,
        allow: ['']
      }
    }, {
      targetPattern: '^I_',
      schema: {
        type: 'number',
        integer: true
      }
    }, {
      targetPattern: '^',
      schema: {
        type: 'string',
        min: 0,
        allow: ['']
      }
    }]
  },
  targetJoiString:
    'Joi.object()\n' +
    '  .keys({ builtin: Joi.number() })\n' +
    '  .pattern(\n' +
    '    /^S_/,\n' +
    '    Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\']),\n' +
    '  )\n' +
    '  .pattern(/^I_/, Joi.number().integer())\n' +
    '  .pattern(\n' +
    '    /^/,\n' +
    '    Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\']),\n' +
    '  )',
  joiUnitTests: [{
    target: { builtin: 42 }, valid: true,
  }, {
    target: { keyword: 'value' }, valid: true,
  }, {
    target: { keyword: 42 }, valid: false,
  }, {
    target: { S_25: 'This is a string' }, valid: true,
  }, {
    target: { I_0: 42 }, valid: true,
  }]
},
];

const testItemsOneOf: TestItem[] = [
  {
    title: 'pattern properties',
    schema: {
      type: 'object',
      properties: {
        builtin: { oneOf: [{ type: 'string', }, { type: 'number' }] }
      },
      required: ['builtin'],
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        builtin: {
          type: 'oneOf',
          items: [{
            type: 'string',
            min: 0,
            allow: ['']
          }, {
            type: 'number',
          }
          ],
          required: true
        }
      },
      unknown: true
    },
    targetJoiString:
      'LJoi.object()\n' +
      '  .keys({\n' +
      '    builtin: extendedJoi\n' +
      '      .oneOf()\n' +
      '      .items([\n' +
      '        LJoi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\']),\n' +
      '        LJoi.number(),\n' +
      '      ])\n' +
      '      .required(),\n' +
      '  })\n' +
      '  .unknown()',
    joiUnitTests: [{
      target: { builtin: [] }, valid: false,
    }, {
      target: { builtin: 1 }, valid: true,
    }, {
      target: { builtin: '111' }, valid: true,
    }]
  }
];

const testItemsAlternatives: TestItem[] = [
  {
    title: 'pattern properties',
    schema: {
      type: 'object',
      properties: {
        builtin: { oneOf: [{ type: 'string', }, { type: 'number' }] }
      },
      required: ['builtin'],
    },
    targetJoiSchema: {
      type: 'object',
      keys: {
        builtin: {
          type: 'alternatives',
          oneOf: [{
            type: 'string',
            min: 0,
            allow: ['']
          }, {
            type: 'number',
          }
          ],
          required: true
        }
      },
      unknown: true
    },
    targetJoiString:
      'Joi.object()\n' +
      '  .keys({\n' +
      '    builtin: Joi.alternatives()\n' +
      '      .match(\'one\')\n' +
      '      .try(\n' +
      '        Joi.string()\n' +
      '          .min(0)\n' +
      '          .allow(...[\'\']),\n' +
      '        Joi.number(),\n' +
      '      )\n' +
      '      .required(),\n' +
      '  })\n' +
      '  .unknown()',
    joiUnitTests: [{
      target: { builtin: [] }, valid: false,
    }, {
      target: { builtin: 1 }, valid: true,
    }, {
      target: { builtin: '111' }, valid: true,
    }]
  }
];

describe('joi object', () => {
  runTest(testItems, resolveJoiObjectSchema, generateObjectJoi, logger);
  runTest(testItems, resolveJoiObjectSchema, generateObjectJoi, logger, { useDeprecatedJoi: true, });
  runTest(testItemsOneOf,
    resolveJoiObjectSchema, generateObjectJoi, logger, { useDeprecatedJoi: true, useExtendedJoi: true });
  runTest(testItemsAlternatives,
    resolveJoiObjectSchema, generateObjectJoi, logger);
});
