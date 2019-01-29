// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import {
  resolveJoiStringSchema, generateStringJoi, dateTimeRegex,
  dateRegex, generateBinaryJoi
} from '../../src/joi/string';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-string');

// tslint:disable-next-line:naming-convention
const stringJSONSchemaTemplate: JSONSchema4 = {
  type: 'string',
};

const testItems: TestItem[] = [
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
    title: 'date',
    schema: {
      format: 'date',
    },
    targetJoiSchema: {
      type: 'string',
      regex: ['^' + dateRegex + '$', 'i'],
    },
    targetJoiString: `Joi.string().regex(new RegExp(\'^${dateRegex}$\', \'i\'))`,
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

const testItemsForBinary: TestItem[] = [
  {
    title: 'binary min == 0 && max',
    schema: {
      format: 'binary',
      minLength: 0,
      maxLength: 3,
    },
    targetJoiSchema: {
      type: 'binary',
      min: 0,
      max: 3,
      allow: [''],
    },
    targetJoiString: 'Joi.binary().min(0).max(3).allow([\'\'])',
  },
];

describe('joi string', () => {
  runTest(testItems, stringJSONSchemaTemplate, resolveJoiStringSchema, generateStringJoi, logger);
  runTest(testItemsForBinary, stringJSONSchemaTemplate, resolveJoiStringSchema, generateBinaryJoi, logger);
});
