import { createJoiItem, JoiString, JoiAny } from './types';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { generateAnyJoi, JoiStatement, openJoi, closeJoi, JoiSpecialChar } from './generate';

export const dateRegex = '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])';
export const timeRegex = '([01][0-9]|2[0-3]):([0-5][0-9]):'
  + '([0-5][0-9]|60)(.[0-9]{3})?(Z|(\\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))';
export const dateTimeRegex = dateRegex + 'T' + timeRegex;
export const octetRegex = '(0x|0X)?[0-9a-fA-F]+';

export function resolveJoiStringSchema(schema: JSONSchema4): JoiString | JoiAny {
  const joiSchema = createJoiItem('string') as JoiString;
  let withZeroMinLength = true;

  // https://json-schema.org/understanding-json-schema/reference/string.html#format
  switch (schema.format) {
    case 'date':
      joiSchema.regex = new RegExp('^' + dateRegex + '$', 'i');
      break;
    case 'time':
      joiSchema.regex = new RegExp('^' + timeRegex + '$', 'i');
      break;
    case 'date-time':
      joiSchema.regex = new RegExp('^' + dateTimeRegex + '$', 'i');
      break;
    case 'binary':
      joiSchema.regex = new RegExp('^' + octetRegex + '$', 'i');
      break;
    case 'email':
      joiSchema.email = true;
      withZeroMinLength = false;
      break;
    case 'hostname':
      joiSchema.hostname = true;
      withZeroMinLength = false;
      break;
    case 'ipv4':
      joiSchema.ip = 'ipv4';
      withZeroMinLength = false;
      break;
    case 'ipv6':
      joiSchema.ip = 'ipv6';
      withZeroMinLength = false;
      break;
    case 'uri':
      joiSchema.uri = true;
      withZeroMinLength = false;
      break;
    case 'byte':
      joiSchema.base64 = true;
      withZeroMinLength = false;
      break;
    case 'uuid':
    case 'guid':
      joiSchema.uuid = true;
      withZeroMinLength = false;
      break;
  }

  // https://json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
  if (schema.pattern) {
    joiSchema.regex = new RegExp(schema.pattern);
  }

  if (joiSchema.regex) {
    const regex = joiSchema.regex;
    if (!regex.test('')) {
      withZeroMinLength = false;
    }
  }

  // https://json-schema.org/understanding-json-schema/reference/string.html#length
  const minLength = schema.minLength;
  const maxLength = schema.maxLength;

  if (minLength !== undefined) {
    if (minLength === maxLength) {
      joiSchema.length = minLength;
    } else {
      joiSchema.min = minLength;
    }
  }

  if (maxLength !== undefined) {
    if (minLength === maxLength) {
      joiSchema.length = maxLength;
    } else {
      joiSchema.max = maxLength;
    }
  }

  if (((minLength === undefined && withZeroMinLength) || minLength === 0)
    && !schema.enum) {
    joiSchema.min = 0;
    joiSchema.allow = [''];
  }
  return joiSchema;
}

export function generateStringJoi(schema: JoiString): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'string()',
  ]);

  if (schema.length !== undefined) {
    content.push(`.length(${schema.length})`);
  } else {
    if (schema.min !== undefined) {
      content.push(`.min(${schema.min})`);
    }
    if (schema.max !== undefined) {
      content.push(`.max(${schema.max})`);
    }
  }

  if (schema.regex) {
    content.push('.regex(' + schema.regex.toString() + ')');
  }

  if (schema.ip) {
    content.push(`.ip({ version: '${schema.ip}' })`);
  }

  content.push(...generateAnyJoi(schema));
  return closeJoi(content);
}
