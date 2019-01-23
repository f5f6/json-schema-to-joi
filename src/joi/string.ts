import { createJoiItem, JoiString, JoiSchema, JoiAny, JoiBinary } from "./types";
import { JSONSchema4 } from "json-schema";
import { generateAnyJoi, JoiStatement, openJoi, closeJoi } from "./generate";

const dateRegex = '(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])';
const timeRegex = '([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(.[0-9]{3})?(Z|(\\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))';
const dateTimeRegex = dateRegex + 'T' + timeRegex;

export function resolveJoiBinarySchema(schema: JSONSchema4): JoiBinary {
  const joiSchema = createJoiItem('binary') as JoiBinary;
  joiSchema.min = schema.minLength;
  joiSchema.max = schema.maxLength;
  return joiSchema;
}

export function resolveJoiStringSchema(schema: JSONSchema4): JoiString | JoiAny {
  const joiSchema = createJoiItem('string') as JoiString;
  if (schema.enum) {
    joiSchema.valid = schema.enum;
    joiSchema.type = 'any';
    return joiSchema;
  }

  switch (schema.format) {
    case 'data':
      joiSchema.regex = ['^' + dateRegex + '$', 'i'];
      break;
    case 'date-time':
      joiSchema.regex = ['^' + dateTimeRegex + '$', 'i'];
      break;
    case 'binary':
      return resolveJoiBinarySchema(schema);
      break;
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

  if (schema.pattern) {
    joiSchema.regex = [schema.pattern];
  }
  joiSchema.min = schema.minLength ? schema.minLength : 0;
  joiSchema.max = schema.maxLength;
  if (joiSchema.min === 0) {
    joiSchema.allow = [''];
  }

  return joiSchema;
}

export function generateStringJoi(schema: JoiString, level: number = 0): JoiStatement[] {
  let content: JoiStatement[] = openJoi(['Joi.string()']);
  if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }
  if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }

  if (schema.regex) {
    content.push(`.pattern(new RegExp(\'${schema.regex.join('\', \'')}\'))`);
  }

  if (schema.ip) {
    content.push(`.ip({ version: '${schema.ip}' })`);
  }

  content.push(...generateAnyJoi(schema, level + 1));
  return closeJoi(content);
}