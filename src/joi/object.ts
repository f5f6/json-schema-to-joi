


import { createJoiItem, JoiObject, JoiSchema } from "./types";
import { JSONSchema4 } from "json-schema";
import * as _ from 'lodash';
import { resolve } from "./resolve";
import { generateAnyJoi, getTailChar, generate as generateJoi } from "./generate";

function resolveProperties(schema: JSONSchema4): { [k: string]: JoiSchema } | undefined {
  const properties = schema.properties;
  if (!properties) {
    return;
  }

  return _.mapValues(properties, (property, key) => {
    const joiSchema = resolve(property);
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
      pattern: /^/,
      schema: resolve(additionalProperties),
    };
  }
  joiSchema.min = schema.minProperties;
  joiSchema.max = schema.maxProperties;
  return joiSchema;
}

export function generateObjectJoi(schema: JoiObject, level: number = 0): string {
  let head = 'Joi.object()';
  let content = '';

  const keys = schema.keys;
  if (keys) {
    content += '.keys({\n';
    _.keys(keys).forEach((key) => {
      let printKey = key;
      if (key.includes(' ') || key.includes('-')) {
        printKey = '\'' + printKey + '\''
      }
      content += ' '.repeat(level + 1) + printKey + ': ' + generateJoi(keys[key], level + 1) + '\n';
    });
    content += '})';
  }
  if (schema.unknown) {
    content += '.unknown()';
  }

  content += generateAnyJoi(schema, level + 1);

  return head + content + getTailChar(level);
}