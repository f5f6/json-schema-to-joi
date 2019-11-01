import { createLogger, TestItem, runTest } from './common';
import { resolveJoiAlternativesSchema, generateAlternativesJoi } from '../../src/joi/alternatives';

const logger = createLogger('test-string');

const testItems: TestItem[] = [{
  title: 'not',
  schema: {
    not: {
      type: 'string'
    }
  },
  targetJoiSchema: {
    type: 'alternatives',
    not: {
      type: 'string',
      min: 0,
      allow: [''],
    }
  },
  targetJoiString: '' +
    'Joi.any().when(\n' +
    '  Joi.alternatives().try(Joi.string().min(0).allow(...[\'\'])), {\n' +
    '    then: Joi.any().forbidden(),\n' +
    '    otherwise: Joi.any(),\n' +
    '  })',
  joiUnitTests: [{
    target: 42, valid: true,
  }, {
    target: { key: 'value' }, valid: true,
  }, {
    target: 'string', valid: false,
  }]
}, {
  title: 'anyOf',
  schema: {
    anyOf: [
      { type: 'string', maxLength: 5 },
      { type: 'number', minimum: 0 }
    ]
  },
  targetJoiSchema: {
    type: 'alternatives',
    anyOf: [{
      type: 'string',
      min: 0,
      max: 5,
      allow: [''],
    }, {
      type: 'number',
      min: 0,
    }],
  },
  targetJoiString: '' +
    'Joi.alternatives().try(\n' +
    '  Joi.string().min(0).max(5).allow(...[\'\']),\n' +
    '  Joi.number().min(0),\n' +
    ')',
  joiUnitTests: [{
    target: 'short', valid: true,
  }, {
    target: 'too long', valid: false,
  }, {
    target: 11, valid: true,
  }, {
    target: -5, valid: false,
  }]
}, {
  title: 'oneOf',
  skipLegacy: true,
  schema: {
    oneOf: [
      { type: 'number', multipleOf: 5 },
      { type: 'number', multipleOf: 3 }
    ]
  },
  targetJoiSchema: {
    type: 'alternatives',
    oneOf: [{
      type: 'number',
      multiple: 5,
    }, {
      type: 'number',
      multiple: 3,
    }],
  },
  targetJoiString: '' +
    'Joi.alternatives().match(\'one\').try(\n' +
    '  Joi.number().multiple(5),\n' +
    '  Joi.number().multiple(3),\n' +
    ')',
  joiUnitTests: [{
    target: 10, valid: true,
  }, {
    target: 9, valid: true,
  }, {
    target: 15, valid: false,
  }]
}, {
  title: 'allOf',
  skipLegacy: true,
  schema: {
    allOf: [
      { type: 'string' },
      { maxLength: 5 }
    ]
  },
  targetJoiSchema: {
    type: 'alternatives',
    allOf: [{
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
    'Joi.alternatives().match(\'all\').try(\n' +
    '  Joi.string().min(0).allow(...[\'\']),\n' +
    '  Joi.string().min(0).max(5).allow(...[\'\']),\n' +
    ')',
  joiUnitTests: [{
    target: 'short', valid: true,
  }, {
    target: 'too long', valid: false,
  }]
},
];

describe('joi alternatives', () => {
  runTest(testItems, resolveJoiAlternativesSchema, generateAlternativesJoi, logger);
  runTest(testItems, resolveJoiAlternativesSchema, generateAlternativesJoi, logger, {
    useDeprecatedJoi: true,
    useExtendedJoi: true
  });
});
