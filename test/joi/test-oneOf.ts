import { createLogger, TestItem, runTest } from './common';
import { resolveJoiOneOfSchema, generateOneOfJoi } from '../../src/joi/oneOf';

const logger = createLogger('test-oneOf');

const testItems: TestItem[] = [{
  title: 'oneOf',
  schema: {
    oneOf: [
      { type: 'number', multipleOf: 5 },
      { type: 'number', multipleOf: 3 }
    ]
  },
  targetJoiSchema: {
    type: 'oneOf',
    items: [{
      type: 'number',
      multiple: 5,
    }, {
      type: 'number',
      multiple: 3,
    }],
  },
  targetJoiString: '' +
    'Joi.extendedJoi\n' +
    '  .oneOf()\n' +
    '  .items([Joi.number().multiple(5), Joi.number().multiple(3)])',
  joiUnitTests: [{
    target: 10, valid: true,
  }, {
    target: 9, valid: true,
  }, {
    target: 15, valid: false,
  }]
},
];

describe('joi all', () => {
  runTest(testItems, resolveJoiOneOfSchema, generateOneOfJoi, logger, {
    useDeprecatedJoi: true, useExtendedJoi: true,
  });
});
