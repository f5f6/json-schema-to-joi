import { JoiNumber, createJoiItem } from './types';
// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiStatement, openJoi, closeJoi, JoiSpecialChar } from './generate';
import * as _ from 'lodash';
import { generateAnyJoi, resolveJoiAnyMeta } from './any';

export function resolveJoiNumberSchema(schema: JSONSchema4): JoiNumber {
  const joiSchema = createJoiItem('number') as JoiNumber;

  // https://json-schema.org/understanding-json-schema/reference/numeric.html#integer
  if (schema.type === 'integer') {
    joiSchema.integer = true;
  }

  // https://json-schema.org/understanding-json-schema/reference/numeric.html#range
  // tslint:disable:no-unused-expression-chai
  _.isNumber(schema.minimum) && (joiSchema.min = schema.minimum);
  _.isNumber(schema.maximum) && (joiSchema.max = schema.maximum);
  schema.exclusiveMinimum && (joiSchema.greater = schema.minimum);
  schema.exclusiveMaximum && (joiSchema.less = schema.maximum);
  // https://json-schema.org/understanding-json-schema/reference/numeric.html#multiples
  _.isNumber(schema.multipleOf) && (joiSchema.multiple = schema.multipleOf);
  // tslint:enable:no-unused-expression-chai
  resolveJoiAnyMeta(joiSchema, schema);
  return joiSchema;
}

export function generateNumberJoi(schema: JoiNumber): JoiStatement[] {
  const content = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'number()'
  ]);
  if (schema.greater !== undefined) {
    content.push(`.greater(${schema.min})`);
  } else if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }

  if (schema.less !== undefined) {
    content.push(`.less(${schema.max})`);
  } else if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }

  if (schema.multiple !== undefined) {
    content.push(`.multiple(${schema.multiple})`);
  }

  content.push(...generateAnyJoi(schema));

  return closeJoi(content);
}
