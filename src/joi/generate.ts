import {
  JoiSchema, JoiString, JoiNumber, JoiObject, JoiBoolean, JoiArray, JoiOneOf, JoiAllOf, JoiReference,
} from './types';
import { generateStringJoi } from './string';
import { generateNumberJoi } from './number';
import { generateObjectJoi } from './object';
import { generateBooleanJoi } from './boolean';
import { generateArrayJoi } from './array';
import { generateAlternativesJoi } from './alternatives';
import { generateOneOfJoi } from './oneOf';
import { generateAllOfJoi } from './allOf';
import { generateReferenceJoi } from './reference';
import { generateAnyJoi } from './any';

export const enum JoiSpecialChar {
  OPEN_JOI, CLOSE_JOI, // indicate the opening and closing of a Joi object
  OPEN_TITLE, CLOSE_TITLE, //
  REFERENCE,
  OPEN_BRACE = '{',     // {
  OPEN_BRACKET = '[',   // [
  OPEN_PAREN = '(',     // (
  CLOSE_BRACE = '}',    // }
  CLOSE_BRACKET = ']',  // ]
  CLOSE_PAREN = ')',    // )
  COMMA = ',',
  COLON = ':',
  SEMI = ';',
  IMPORTED_JOI_NAME = 200,
  IMPORTED_EXTENDED_JOI_NAME,
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

export function generateJoiStatement(schema: JoiSchema, withTitle: boolean = false): JoiStatement[] {
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
    case 'boolean':
      content.push(...generateBooleanJoi(schema as JoiBoolean));
      break;
    case 'alternatives':
      content.push(...generateAlternativesJoi(schema as JoiBoolean));
      break;
    case 'array':
      content.push(...generateArrayJoi(schema as JoiArray));
      break;
    case 'oneOf':
      content.push(...generateOneOfJoi(schema as JoiOneOf));
      break;
    case 'allOf':
      content.push(...generateAllOfJoi(schema as JoiAllOf));
      break;
    case 'reference':
      content.push(...generateReferenceJoi(schema as JoiReference));
      break;
    case 'any':
    default:
      content.push(...generateAnyJoi(schema));
      break;
  }
  if (withTitle) {
    content.push(JoiSpecialChar.SEMI);
    return closeJoi(content);
  }
  return content;
}
