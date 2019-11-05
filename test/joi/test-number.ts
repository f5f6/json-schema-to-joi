// tslint:disable-next-line:no-implicit-dependencies
import { resolveJoiNumberSchema, generateNumberJoi } from '../../src/joi/number';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-number');

const testItems: TestItem[] = [{
  title: 'integer',
  schema: {
    type: 'integer',
  },
  targetJoiSchema: {
    type: 'number',
    integer: true,
  },
  targetJoiString: 'Joi.number().integer()',
  joiUnitTests: [{
    target: 42, valid: true,
  }, {
    target: -1, valid: true,
  }, {
    target: 3.1415926, valid: false,
  }, {
    target: '42', valid: false,
  }]
}, {
  title: 'number',
  schema: {
    type: 'number',
  },
  targetJoiSchema: {
    type: 'number',
  },
  targetJoiString: 'Joi.number()',
  joiUnitTests: [{
    target: 42, valid: true,
  }, {
    target: -1, valid: true,
  }, {
    target: 5, valid: true,
  }, {
    target: 2.99792458e8, valid: true,
  }, {
    target: '42', valid: false,
  }]
}, {
  title: 'multiple',
  schema: {
    multipleOf: 10,
  },
  targetJoiSchema: {
    type: 'number',
    multiple: 10,
  },
  targetJoiString: 'Joi.number().multiple(10)',
  joiUnitTests: [{
    target: 0, valid: true,
  }, {
    target: 10, valid: true,
  }, {
    target: 20, valid: true,
  }, {
    target: 23, valid: false,
  }, {
    target: '40', valid: false,
  }]
}, {
  title: 'range: min less',
  schema: {
    minimum: 0,
    maximum: 100,
    exclusiveMaximum: true,
  },
  targetJoiSchema: {
    type: 'number',
    min: 0,
    max: 100,
    less: 100,
  },
  targetJoiString: 'Joi.number()\n  .min(0)\n  .less(100)',
  joiUnitTests: [{
    target: -1, valid: false,
  }, {
    target: 0, valid: true,
  }, {
    target: 10, valid: true,
  }, {
    target: 99, valid: true,
  }, {
    target: 100, valid: false,
  }, {
    target: 101, valid: false,
  }]
}, {
  title: 'range: greater max',
  schema: {
    minimum: 0,
    maximum: 100,
    exclusiveMinimum: true,
  },
  targetJoiSchema: {
    type: 'number',
    min: 0,
    max: 100,
    greater: 0,
  },
  targetJoiString: 'Joi.number()\n  .greater(0)\n  .max(100)',
  joiUnitTests: [{
    target: -1, valid: false,
  }, {
    target: 0, valid: false,
  }, {
    target: 10, valid: true,
  }, {
    target: 99, valid: true,
  }, {
    target: 100, valid: true,
  }, {
    target: 101, valid: false,
  }]
},
];

describe('joi number', () => {
  runTest(testItems, resolveJoiNumberSchema, generateNumberJoi, logger);
});
