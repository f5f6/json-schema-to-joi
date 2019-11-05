import { createJoiItem, JoiArray, JoiSchema } from './types';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import * as _ from 'lodash';
import { resolveJSONSchema } from './resolve';
import { JoiStatement, openJoi, generateAnyJoi, closeJoi, JoiSpecialChar, generateJoiStatement } from './generate';
import { Options } from './options';

function resolveAsArray(schema: JSONSchema4 | JSONSchema4[], options?: Options): JoiSchema[] {
  if (_.isArray(schema)) {
    return schema.map((v) => {
      return resolveJSONSchema(v, options);
    });
  }
  return [resolveJSONSchema(schema, options)];
}

export function resolveJoiArraySchema(schema: JSONSchema4, options?: Options): JoiArray {
  const joiSchema = createJoiItem('array') as JoiArray;

  if (schema.items) {
    let itemsIsArray = false;
    if (_.isArray(schema.items)) {
      itemsIsArray = true;
    }
    // https://json-schema.org/understanding-json-schema/reference/array.html#items
    const items = resolveAsArray(schema.items, options);
    if (itemsIsArray) {
      // https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
      joiSchema.ordered = items;
      if (schema.additionalItems === true || schema.additionalItems === undefined) {
        joiSchema.items = [{ type: 'any' }];
      } else if (schema.additionalItems !== false) {
        joiSchema.items = [resolveJSONSchema(schema.additionalItems, options)];
      }
    } else {
      // https://json-schema.org/understanding-json-schema/reference/array.html#list-validation
      joiSchema.items = items;
    }
  }

  // tslint:disable: no-unused-expression-chai
  _.isNumber(schema.minItems) && (joiSchema.min = schema.minItems);
  _.isNumber(schema.maxItems) && (joiSchema.max = schema.maxItems);
  _.isBoolean(schema.uniqueItems) && (joiSchema.unique = schema.uniqueItems);
  // tslint:enable: no-unused-expression-chai

  return joiSchema;
}

export function generateArrayJoi(schema: JoiArray): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'array()'
  ]);
  if (schema.ordered) {
    content.push(...[
      '.ordered',
      JoiSpecialChar.OPEN_PAREN,
    ]);

    const items = schema.ordered;

    items.forEach((item, i) => {
      content.push(...generateJoiStatement(item));
      if (i !== items.length - 1) {
        content.push(...[
          JoiSpecialChar.COMMA,
        ]);
      }
    });

    content.push(...[
      JoiSpecialChar.CLOSE_PAREN,
    ]);
  }
  if (schema.items) {
    content.push(...[
      '.items',
      JoiSpecialChar.OPEN_PAREN,
    ]);

    const items = schema.items;

    items.forEach((item, i) => {
      content.push(...generateJoiStatement(item));
      if (i !== items.length - 1) {
        content.push(JoiSpecialChar.COMMA);
      }
    });

    content.push(...[
      JoiSpecialChar.CLOSE_PAREN,
    ]);
  }
  if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }
  if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }

  content.push(...generateAnyJoi(schema));
  return closeJoi(content);
}
