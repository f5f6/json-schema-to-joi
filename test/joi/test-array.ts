import { resolveJoiArraySchema, generateArrayJoi } from '../../src/joi/array';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-array');

const testItems: TestItem[] = [{
  title: 'array',
  schema: { type: 'array' },
  targetJoiSchema: { type: 'array' },
  targetJoiString: 'Joi.array()',
  joiUnitTests: [{
    target: [1, 2, 3, 4, 5], valid: true,
  }, {
    target: [3, 'different', { types: 'of values' }], valid: true,
  }, {
    target: [], valid: true,
  }, {
    target: { Not: 'an array' }, valid: false,
  }]
}, {
  title: 'list validation',
  schema: {
    type: 'array',
    items: {
      type: 'number'
    },
  },
  targetJoiSchema: {
    type: 'array',
    items: [{
      type: 'number',
    }],
  },
  targetJoiString: 'Joi.array().items(Joi.number())',
  joiUnitTests: [{
    target: [1, 2, 3, 4, 5], valid: true,
  }, {
    target: [1, 2, '3', 4, 5], valid: false,
  }, {
    target: [], valid: true,
  }]
}, {
  title: 'tuple validation',
  schema: {
    type: 'array',
    items: [{
      type: 'number'
    }, {
      type: 'string'
    }, {
      type: 'string',
      enum: ['Street', 'Avenue', 'Boulevard']
    }, {
      type: 'string',
      enum: ['NW', 'NE', 'SW', 'SE']
    }]
  },
  targetJoiSchema: {
    type: 'array',
    ordered: [{
      type: 'number',
    }, {
      type: 'string',
      min: 0,
      allow: [''],
    }, {
      type: 'string',
      valid: ['Street', 'Avenue', 'Boulevard'],
    }, {
      type: 'string',
      valid: ['NW', 'NE', 'SW', 'SE']
    }],
    items: [{
      type: 'any'
    }]
  },
  targetJoiString:
    'Joi.array()\n' +
    '  .ordered(\n' +
    '    Joi.number(),\n' +
    '    Joi.string()\n' +
    '      .min(0)\n' +
    '      .allow(...[\'\']),\n' +
    '    Joi.string().valid(...[\'Street\', \'Avenue\', \'Boulevard\']),\n' +
    '    Joi.string().valid(...[\'NW\', \'NE\', \'SW\', \'SE\']),\n' +
    '  )\n' +
    '  .items(Joi.any())',
  joiUnitTests: [{
    target: [1600, 'Pennsylvania', 'Avenue', 'NW'], valid: true,
  }, {
    target: [24, 'Sussex', 'Drive'], valid: false,
  }, {
    target: ['Palais de l\'Élysée'], valid: false,
  }, {
    target: [10, 'Downing', 'Street'], valid: true,
  }, {
    target: [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington'], valid: true,
  }],
}, {
  title: 'tuple validation with additionalItems = false',
  schema: {
    type: 'array',
    items: [{
      type: 'number'
    }, {
      type: 'string'
    }, {
      type: 'string',
      enum: ['Street', 'Avenue', 'Boulevard']
    }, {
      type: 'string',
      enum: ['NW', 'NE', 'SW', 'SE']
    }],
    additionalItems: false,
  },
  targetJoiSchema: {
    type: 'array',
    ordered: [{
      type: 'number',
    }, {
      type: 'string',
      min: 0,
      allow: [''],
    }, {
      type: 'string',
      valid: ['Street', 'Avenue', 'Boulevard'],
    }, {
      type: 'string',
      valid: ['NW', 'NE', 'SW', 'SE']
    }],
  },
  targetJoiString:
    'Joi.array().ordered(\n' +
    '  Joi.number(),\n' +
    '  Joi.string()\n' +
    '    .min(0)\n' +
    '    .allow(...[\'\']),\n' +
    '  Joi.string().valid(...[\'Street\', \'Avenue\', \'Boulevard\']),\n' +
    '  Joi.string().valid(...[\'NW\', \'NE\', \'SW\', \'SE\']),\n' +
    ')',
  joiUnitTests: [{
    target: [1600, 'Pennsylvania', 'Avenue', 'NW'], valid: true,
  }, {
    target: [24, 'Sussex', 'Drive'], valid: false,
  }, {
    target: ['Palais de l\'Élysée'], valid: false,
  }, {
    target: [10, 'Downing', 'Street'], valid: true,
  }, {
    target: [1600, 'Pennsylvania', 'Avenue', 'NW', 'Washington'], valid: false,
  }]
}, {
  title: 'length',
  schema: {
    minItems: 2,
    maxItems: 3,
  },
  targetJoiSchema: {
    type: 'array',
    min: 2,
    max: 3,
  },
  targetJoiString: 'Joi.array()\n  .min(2)\n  .max(3)',
  joiUnitTests: [{
    target: [], valid: false,
  }, {
    target: [1], valid: false,
  }, {
    target: [1, 2], valid: true,
  }, {
    target: [1, 2, 3], valid: true,
  }, {
    target: [1, 2, 3, 4], valid: false,
  }]
}, {
  title: 'uniqueness',
  schema: {
    uniqueItems: true,
  },
  targetJoiSchema: {
    type: 'array',
    unique: true
  },
  targetJoiString: 'Joi.array().unique()',
  joiUnitTests: [{
    target: [1, 2, 3, 4, 5], valid: true,
  }, {
    target: [1, 2, 3, 3, 5], valid: false,
  }, {
    target: [], valid: true,
  }]
},
];

describe('joi array', () => {
  runTest(testItems, resolveJoiArraySchema, generateArrayJoi, logger);
  runTest(testItems, resolveJoiArraySchema, generateArrayJoi, logger, { useDeprecatedJoi: true, });
});
