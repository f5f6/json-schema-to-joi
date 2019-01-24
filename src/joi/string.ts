import { createJoiItem, JoiString, JoiSchema, JoiAny, JoiBinary } from './types';
import { JSONSchema4 } from 'json-schema';
import { generateAnyJoi, JoiStatement, openJoi, closeJoi } from './generate';
import * as _ from 'lodash';

export const dateRegex = '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])';
export const timeRegex = '([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(.[0-9]{3})?(Z|(\\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))';
export const dateTimeRegex = dateRegex + 'T' + timeRegex;

// export function resolveJoiBinarySchema(schema: JSONSchema4): JoiBinary {
//   const joiSchema = createJoiItem('binary') as JoiBinary;
//   joiSchema.min = schema.minLength;
//   joiSchema.max = schema.maxLength;
//   return joiSchema;
// }

export function resolveJoiStringSchema(schema: JSONSchema4): JoiString | JoiAny {
  const joiSchema = createJoiItem('string') as JoiString;
  if (schema.enum) {
    joiSchema.valid = schema.enum;
    joiSchema.type = 'any';
    return joiSchema;
  }
  // https://json-schema.org/understanding-json-schema/reference/string.html#format
  switch (schema.format) {
    // case 'date':
    //   joiSchema.regex = ['^' + dateRegex + '$', 'i'];
    //   break;
    case 'date-time':
      joiSchema.regex = ['^' + dateTimeRegex + '$', 'i'];
      break;
    // case 'binary':
    //   return resolveJoiBinarySchema(schema);
    //   break;
    case 'email':
      joiSchema.email = true;
      break;
    case 'hostname':
      joiSchema.hostname = true;
      break;
    case 'ipv4':
      joiSchema.ip = 'ipv4';
      break;
    case 'ipv6':
      joiSchema.ip = 'ipv6';
      break;
    case 'uri':
      joiSchema.uri = true;
      break;
    case 'byte':
      joiSchema.base64 = true;
      break;
    case 'uuid':
    case 'guid':
      joiSchema.uuid = true;
      break;
  }

  https: // json-schema.org/understanding-json-schema/reference/string.html#regular-expressions
  if (schema.pattern) {
    joiSchema.regex = [schema.pattern];
  }

  // https://json-schema.org/understanding-json-schema/reference/string.html#length
  _.isNumber(schema.minLength) && (joiSchema.min = schema.minLength);
  _.isNumber(schema.maxLength) && (joiSchema.max = schema.maxLength);

  if (joiSchema.min === 0) {
    joiSchema.allow = [''];
  }

  return joiSchema;
}

export function generateStringJoi(schema: JoiString, level: number = 0): JoiStatement[] {
  const content: JoiStatement[] = openJoi(['Joi.string()']);
  if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }
  if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }

  if (schema.regex) {
    content.push(`.regex(new RegExp(\'${schema.regex.join('\', \'')}\'))`);
  }

  if (schema.ip) {
    content.push(`.ip({ version: '${schema.ip}' })`);
  }

  content.push(...generateAnyJoi(schema, level + 1));
  return closeJoi(content);
}
