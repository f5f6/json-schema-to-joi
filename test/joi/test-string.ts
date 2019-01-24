import * as chai from 'chai';
import { JSONSchema4 } from 'json-schema';
import * as _ from 'lodash';
import * as bunyan from 'bunyan';
import { resolveJoiStringSchema, generateStringJoi, dateTimeRegex } from '../../src/joi/string';
import { formatJoi } from '../../src/joi';

const logger = bunyan.createLogger({
  level: 'trace',
  name: 'test-string',
});

const expect = chai.expect;

const stringJSONSchemaTemplate: JSONSchema4 = {
  type: 'string',
};

const testItems = [
  {
    title: 'regexp',
    schema: {
      pattern: '^test$',
    },
    targetJoiSchema: {
      type: 'string',
      regex: ['^test$'],
    },
    targetJoiString: 'Joi.string().regex(new RegExp(\'^test$\'))',
  },
  {
    title: 'ipv4',
    schema: {
      format: 'ipv4',
    },
    targetJoiSchema: {
      type: 'string',
      ip: 'ipv4',
    },
    targetJoiString: 'Joi.string().ip({ version: \'ipv4\' })',
  },
  {
    title: 'ipv6',
    schema: {
      format: 'ipv6',
    },
    targetJoiSchema: {
      type: 'string',
      ip: 'ipv6',
    },
    targetJoiString: 'Joi.string().ip({ version: \'ipv6\' })',
  },
  {
    title: 'email',
    schema: {
      format: 'email',
    },
    targetJoiSchema: {
      type: 'string',
      email: true,
    },
    targetJoiString: 'Joi.string().email()',
  },
  {
    title: 'hostname',
    schema: {
      format: 'hostname',
    },
    targetJoiSchema: {
      type: 'string',
      hostname: true,
    },
    targetJoiString: 'Joi.string().hostname()',
  },
  {
    title: 'uri',
    schema: {
      format: 'uri',
    },
    targetJoiSchema: {
      type: 'string',
      uri: true,
    },
    targetJoiString: 'Joi.string().uri()',
  },
  {
    title: 'byte',
    schema: {
      format: 'byte',
    },
    targetJoiSchema: {
      type: 'string',
      base64: true,
    },
    targetJoiString: 'Joi.string().base64()',
  },
  {
    title: 'uuid',
    schema: {
      format: 'uuid',
    },
    targetJoiSchema: {
      type: 'string',
      uuid: true,
    },
    targetJoiString: 'Joi.string().uuid()',
  },
  {
    title: 'guid',
    schema: {
      format: 'guid',
    },
    targetJoiSchema: {
      type: 'string',
      uuid: true,
    },
    targetJoiString: 'Joi.string().uuid()',
  },
  {
    title: 'date-time',
    schema: {
      format: 'date-time',
    },
    targetJoiSchema: {
      type: 'string',
      regex: ['^' + dateTimeRegex + '$', 'i'],
    },
    targetJoiString: `Joi.string().regex(new RegExp(\'^${dateTimeRegex}$\', \'i\'))`,
  },
  {
    title: 'min > 0 && max',
    schema: {
      minLength: 1,
      maxLength: 3,
    },
    targetJoiSchema: {
      type: 'string',
      min: 1,
      max: 3,
    },
    targetJoiString: 'Joi.string().min(1).max(3)',
  },
  {
    title: 'min == 0 && max',
    schema: {
      minLength: 0,
      maxLength: 3,
    },
    targetJoiSchema: {
      type: 'string',
      min: 0,
      max: 3,
      allow: [''],
    },
    targetJoiString: 'Joi.string().min(0).max(3).allow([\'\'])',
  },
];

describe('joi string', () => {
  testItems.forEach((item) => {
    it(item.title, () => {
      const schema = _.assign({}, stringJSONSchemaTemplate, item.schema);
      const joiSchema = resolveJoiStringSchema(schema);
      const joiStatements = generateStringJoi(joiSchema);
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
