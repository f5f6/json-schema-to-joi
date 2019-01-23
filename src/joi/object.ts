


import { createJoiItem, JoiObject, JoiSchema } from "./types";
import { JSONSchema4 } from "json-schema";
import * as _ from 'lodash';
import { resolveJSONSchema } from "./resolve";
import { generateAnyJoi, generateJoi as generateJoi, JoiStatement, JoiSpecialChar, openJoi, closeJoi } from "./generate";

function resolveProperties(schema: JSONSchema4): { [k: string]: JoiSchema } | undefined {
  const properties = schema.properties;
  if (!properties) {
    return;
  }

  return _.mapValues(properties, (property, key) => {
    const joiSchema = resolveJSONSchema(property);
    joiSchema.required = (schema.required && schema.required.includes(key));
    return joiSchema;
  });
}

export function resolveJoiObjectSchema(schema: JSONSchema4): JoiObject {
  const joiSchema = createJoiItem('object') as JoiObject;
  joiSchema.keys = resolveProperties(schema);
  const additionalProperties = schema.additionalProperties
  if (additionalProperties === true) {
    joiSchema.unknown = true;
  } else if (additionalProperties) {
    joiSchema.pattern = {
      pattern: '^',
      schema: resolveJSONSchema(additionalProperties),
    };
  }
  joiSchema.min = schema.minProperties;
  joiSchema.max = schema.maxProperties;
  return joiSchema;
}

export function generateObjectJoi(schema: JoiObject, level: number = 0): JoiStatement[] {
  let content: JoiStatement[] = openJoi(['Joi.object()']);

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
        printKey = '\'' + printKey + '\''
      }
      content.push(printKey)
      content.push(JoiSpecialChar.COLON);
      content.push(...generateJoi(keys[key], level + 1));
      content.push(JoiSpecialChar.COMMA);
    });
    content.push(...[
      JoiSpecialChar.CLOSE_BRACE,
      JoiSpecialChar.CLOSE_PAREN,
    ]);
  }
  if (schema.unknown) {
    content.push('.unknown()');
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