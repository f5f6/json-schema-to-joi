
import { createJoiItem, JoiObject, JoiSchema } from './types';
import { JSONSchema4 } from 'json-schema';
import * as _ from 'lodash';
import { resolveJSONSchema } from './resolve';
import { generateAnyJoi, generateJoi as generateJoi, JoiStatement, JoiSpecialChar, openJoi, closeJoi } from './generate';

function resolveProperties(schema: JSONSchema4): { [k: string]: JoiSchema } | undefined {
  const properties = schema.properties;
  if (!properties) {
    return;
  }

  return _.mapValues(properties, (property, key) => {
    const joiSchema = resolveJSONSchema(property);
    // https://json-schema.org/understanding-json-schema/reference/object.html#required-properties
    const required = (schema.required && schema.required.includes(key));
    if (required) {
      joiSchema.required = true;
    }
    return joiSchema;
  });
}

export function resolveJoiObjectSchema(schema: JSONSchema4): JoiObject {
  const joiSchema = createJoiItem('object') as JoiObject;
  // https://json-schema.org/understanding-json-schema/reference/object.html#properties
  joiSchema.keys = resolveProperties(schema);
  let additionalProperties = schema.additionalProperties;
  if (additionalProperties === undefined) {
    additionalProperties = true;
  }
  if (typeof additionalProperties === 'boolean') {
    joiSchema.unknown = additionalProperties;
  } else {
    joiSchema.pattern = {
      pattern: '^',
      schema: resolveJSONSchema(additionalProperties),
    };
  }

  // https://json-schema.org/understanding-json-schema/reference/object.html#size
  joiSchema.min = schema.minProperties;
  joiSchema.max = schema.maxProperties;

  // TODO: Dependencies
  //   https://json-schema.org/understanding-json-schema/reference/object.html#dependencies

  // TODO: Pattern Properties
  //   https://json-schema.org/understanding-json-schema/reference/object.html#pattern-properties
  return joiSchema;
}

export function generateObjectJoi(schema: JoiObject, level: number = 0): JoiStatement[] {
  const content: JoiStatement[] = openJoi(['Joi.object()']);

  const keys = schema.keys;
  if (keys) {
    content.push(...[
      '.keys',
      JoiSpecialChar.OPEN_PAREN,
      JoiSpecialChar.OPEN_BRACE,
    ]);
    _.keys(keys).forEach((key) => {
      let printKey = key;
      if (key.includes(' ') || key.includes('-')) {
        printKey = '\'' + printKey + '\'';
      }
      content.push(printKey);
      content.push(JoiSpecialChar.COLON);
      content.push(...generateJoi(keys[key], level + 1));
      content.push(JoiSpecialChar.COMMA);
    });
    content.push(...[
      JoiSpecialChar.CLOSE_BRACE,
      JoiSpecialChar.CLOSE_PAREN,
    ]);
  }

  if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }
  if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }

  if (schema.pattern) {
    const pattern = schema.pattern.pattern;
    const subSchema = schema.pattern.schema;
    content.push(...[
      '.pattern',
      JoiSpecialChar.OPEN_PAREN,
    ]);
    if (typeof pattern === 'string') {
      content.push('/' + pattern + '/');
    } else {
      content.push(...generateJoi(pattern));
    }
    content.push(JoiSpecialChar.COMMA);

    content.push(...generateAnyJoi(subSchema, level + 1));

    content.push(JoiSpecialChar.CLOSE_PAREN);
  }

  content.push(...generateAnyJoi(schema, level + 1));

  return closeJoi(content);
}
