import { resolveJoiBooleanSchema, generateBooleanJoi } from '../../src/joi/boolean';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-boolean');

const testItems: TestItem[] = [{
  title: 'boolean',
  schema: {
    type: 'boolean',
  },
  targetJoiSchema: {
    type: 'boolean',
  },
  targetJoiString: 'Joi.boolean()',
  joiUnitTests: [{
    target: true, valid: true,
  }, {
    target: false, valid: true,
  }, {
    target: 'true', valid: false,
  }]
}];

describe('joi boolean', () => {
  runTest(testItems, resolveJoiBooleanSchema, generateBooleanJoi, logger);
  runTest(testItems, resolveJoiBooleanSchema, generateBooleanJoi, logger, { useDeprecatedJoi: true, });
});
