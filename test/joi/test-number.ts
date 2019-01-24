import * as chai from 'chai';
// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import * as _ from 'lodash';
import * as bunyan from 'bunyan';
import { formatJoi } from '../../src/joi';
import { resolveJoiNumberSchema, generateNumberJoi } from '../../src/joi/number';

const logger = bunyan.createLogger({
  level: 'trace',
  name: 'test-number',
});

const expect = chai.expect;

// tslint:disable-next-line:naming-convention
const numberJSONSchemaTemplate: JSONSchema4 = {
  type: 'number',
};

const testItems = [
  {
    title: 'integer',
    schema: {
      type: 'integer',
    },
    targetJoiSchema: {
      type: 'number',
      integer: true,
    },
    targetJoiString: 'Joi.number().integer()',
  },
  {
    title: 'number',
    schema: {
      type: 'number',
    },
    targetJoiSchema: {
      type: 'number',
    },
    targetJoiString: 'Joi.number()',
  },
  {
    title: 'min max',
    schema: {
      minimum: 1,
      maximum: 3,
    },
    targetJoiSchema: {
      type: 'number',
      min: 1,
      max: 3,
    },
    targetJoiString: 'Joi.number().min(1).max(3)',
  },
  {
    title: 'greater less',
    schema: {
      type: 'number',
      minimum: 1,
      maximum: 3,
      exclusiveMinimum: true,
      exclusiveMaximum: true,
    },
    targetJoiSchema: {
      type: 'number',
      min: 1,
      max: 3,
      greater: 1,
      less: 3,
    },
    targetJoiString: 'Joi.number().greater(1).less(3)',
  },
  {
    title: 'enum',
    schema: {
      enum: [1, 3, 5],
    },
    targetJoiSchema: {
      type: 'number',
      valid: [1, 3, 5],
    },
    targetJoiString: 'Joi.number().valid([1,3,5])',
  },
];

describe('joi number', () => {
  testItems.forEach((item) => {
    it(item.title, () => {
      const schema = _.assign({}, numberJSONSchemaTemplate, item.schema);
      const joiSchema = resolveJoiNumberSchema(schema);
      const joiStatements = generateNumberJoi(joiSchema);
      const joiString = formatJoi(joiStatements);
      logger.debug({
        targetJoiSchema: item.targetJoiSchema,
        joiSchema,
        targetJoiString: item.targetJoiString,
        joiString,
      });
      expect(_.isEqual(item.targetJoiSchema, joiSchema), 'Joi schema equal').to.be.equal(true);
      expect(_.isEqual(item.targetJoiString, joiString), 'Joi string equal').to.be.equal(true);
    });
  });
});
