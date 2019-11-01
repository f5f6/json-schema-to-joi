import { createLogger, TestItem, runTest } from './common';
import { resolveJoiAllOfSchema, generateAllOfJoi } from '../../src/joi/allOf';

const logger = createLogger('test-allOf');

const testItems: TestItem[] = [{
  title: 'allOf',
  schema: {
    allOf: [
      { type: 'string' },
      { maxLength: 5 }
    ]
  },
  targetJoiSchema: {
    type: 'allOf',
    items: [{
      type: 'string',
      min: 0,
      allow: [''],
    }, {
      type: 'string',
      min: 0,
      max: 5,
      allow: [''],
    }],
  },
  targetJoiString: '' +
    'Joi.extendedJoi.allOf().items([\n' +
    '  Joi.string().min(0).allow(...[\'\']),\n' +
    '  Joi.string().min(0).max(5).allow(...[\'\']),\n' +
    '])',
  joiUnitTests: [{
    target: 'short', valid: true,
  }, {
    target: 'too long', valid: false,
  }]
},
];

describe('joi all', () => {
  runTest(testItems, resolveJoiAllOfSchema, generateAllOfJoi, logger, {
    useDeprecatedJoi: true, useExtendedJoi: true,
  });
});
