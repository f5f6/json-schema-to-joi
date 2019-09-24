import {
  JoiSchema, JoiString, JoiAny, JoiNumber, JoiBinary, JoiObject, JoiBoolean, JoiArray,
  JoiAllOf, JoiOneOf
} from './types';
import * as _ from 'lodash';
import { generateStringJoi, generateBinaryJoi } from './string';
import { generateNumberJoi } from './number';
import { generateObjectJoi } from './object';
import { generateBooleanJoi } from './boolean';
import { generateArrayJoi } from './array';
import { generateAllOfJoi } from './allOf';
import { generateAlternativesJoi } from './alternatives';
import { generateOneOfJoi } from './oneOf';

export const enum JoiSpecialChar {
  OPEN_JOI, CLOSE_JOI, // indicate the opening and closing of a Joi object
  OPEN_TITLE, CLOSE_TITLE, //
  OPEN_BRACE,     // {
  OPEN_BRACKET,   // [
  OPEN_PAREN,     // (
  CLOSE_BRACE,    // }
  CLOSE_BRACKET,  // ]
  CLOSE_PAREN,    // )
  LEVEL_S = OPEN_BRACE,
  LEVEL_E = CLOSE_PAREN,
  COMMA = 88,
  COLON = 99,
  NEWLINE = 100,
}

export const OPEN = [JoiSpecialChar.OPEN_BRACE, JoiSpecialChar.OPEN_BRACKET, JoiSpecialChar.OPEN_PAREN];
export const CLOSE = [JoiSpecialChar.CLOSE_BRACE, JoiSpecialChar.CLOSE_BRACKET, JoiSpecialChar.CLOSE_PAREN];
export const OPEN_CLOSE = [...OPEN, ...CLOSE];

export type JoiStatement = string | JoiSpecialChar;

export function openJoi(statement: JoiStatement[]): JoiStatement[] {
  return [JoiSpecialChar.OPEN_JOI, ...statement];
}

export function closeJoi(statement: JoiStatement[]): JoiStatement[] {
  statement.push(JoiSpecialChar.CLOSE_JOI);
  return statement;
}

export function generateJoi(schema: JoiSchema, withTitle: boolean = false): JoiStatement[] {
  const content: JoiStatement[] = withTitle ?
    openJoi([
      JoiSpecialChar.OPEN_TITLE, schema.label!, JoiSpecialChar.CLOSE_TITLE
    ]) : [];
  switch (schema.type) {
    case 'object':
      content.push(...generateObjectJoi(schema as JoiObject));
      break;
    case 'string':
      content.push(...generateStringJoi(schema as JoiString));
      break;
    case 'number':
      content.push(...generateNumberJoi(schema as JoiNumber));
      break;
    case 'binary':
      content.push(...generateBinaryJoi(schema as JoiBinary));
      break;
    case 'boolean':
      content.push(...generateBooleanJoi(schema as JoiBoolean));
      break;
    case 'alternatives':
      content.push(...generateAlternativesJoi(schema as JoiBoolean));
      break;
    case 'array':
      content.push(...generateArrayJoi(schema as JoiArray));
      break;
    case 'allOf':
      content.push(...generateAllOfJoi(schema as JoiAllOf));
      break;
    case 'oneOf':
      content.push(...generateOneOfJoi(schema as JoiOneOf));
      break;
    case 'any':
    default:
      content.push(...generateAnyJoi(schema));
      break;
  }
  return withTitle ? closeJoi(content) : content;
}

export function generateAnyJoi(schema: JoiAny): JoiStatement[] {
  let content: JoiStatement[]
    = (schema.type === 'any') ? openJoi(['Joi.any()']) : [];
  if (schema.allow) {
    content.push(`.allow(${JSON.stringify(schema.allow)})`);
  }
  if (schema.valid) {
    content.push(`.valid(${JSON.stringify(schema.valid)})`);
  }
  if (schema.invalid) {
    content.push(`.invalid(${JSON.stringify(schema.invalid)})`);
  }

  if (schema.default) {
    content.push(`.default(${JSON.stringify(schema.default)})`);
  }

  content = generateBooleanKeys(schema, content);

  // tslint:disable-next-line: no-commented-code
  // TODO
  // if (schema.description) {
  //   content.push(`.description(${JSON.stringify(schema.description)})`);
  // }
  return (schema.type === 'any') ? closeJoi(content) : content;
}

export function generateBooleanKeys(schema: JoiAny, content: JoiStatement[]): JoiStatement[] {
  _.keys(schema).forEach((key) => {
    if (schema[key] === true) {
      content.push(`.${key}()`);
    } else if (schema[key] === false) {
      content.push(`.${key}(false)`);
    }
  });

  return content;
}
