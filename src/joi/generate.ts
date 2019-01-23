import { JoiSchema, JoiObject, JoiString, JoiAny, JoiNumber } from './types';
import * as _ from 'lodash';
import { generateStringJoi } from './string';
import { generateNumberJoi } from './number';
import { generateObjectJoi } from './object';

export const enum JoiSpecialChar {
  OPEN_JOI, CLOSE_JOI, // indicate the opening and closing of a Joi object
  OPEN_TITLE, CLOSE_TITLE, // 
  OPEN_BRACE,
  OPEN_BRACKET,
  OPEN_PAREN,
  CLOSE_BRACE, // {}
  CLOSE_BRACKET, // []
  CLOSE_PAREN, // ()
  LEVEL_S = OPEN_BRACE,
  LEVEL_E = CLOSE_PAREN,
  COMMA = 88, 
  COLON = 99,
}

export type JoiStatement = string | JoiSpecialChar;

export function openJoi(statement: JoiStatement[]): JoiStatement[] {
  return [JoiSpecialChar.OPEN_JOI, ...statement];
}

export function closeJoi(statement: JoiStatement[]): JoiStatement[] {
  statement.push(JoiSpecialChar.CLOSE_JOI);
  return statement;
}


export function generateJoi(schema: JoiSchema, level: number = 0): JoiStatement[] {
  let content: JoiStatement[] = level === 0 ?
  openJoi([ 
    JoiSpecialChar.OPEN_TITLE, schema.label!, JoiSpecialChar.CLOSE_TITLE 
  ]) : [];
  let realSchema;
  switch (schema.type) {
    case 'object':
      content.push(...generateObjectJoi(schema as JoiString, level + 1));
      break;
    case 'string':
      content.push(...generateStringJoi(schema as JoiString, level + 1));
      break;
    case 'number':
      content.push(...generateNumberJoi(schema as JoiNumber, level + 1));
      break;
  }
  return level === 0 ? closeJoi(content) : content;
}

export function generateAnyJoi(schema: JoiAny, level: number = 0): JoiStatement[] {
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

  if (schema.description) {
    content.push(`.description(${JSON.stringify(schema.description)})`);
  }

  content = generateBooleanKeys(schema, content);

  return (schema.type === 'any') ? closeJoi(content) : content;
}

export function generateBooleanKeys(schema: JoiAny, content: JoiStatement[]): JoiStatement[] {
  _.keys(schema).forEach((key) => {
    if (schema[key] === true) {
      content.push(`.${key}()`);
    }
  })

  return content;
}