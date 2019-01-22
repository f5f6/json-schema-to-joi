import { JSONSchema4, JSONSchema4Type, JSONSchema4TypeName } from "json-schema";
import { JoiType, JoiSchema, createJoiItem, JoiAlternatives } from "./types";
import { getJoiArraySchema as resolveJoiArraySchema } from "./array";
import * as _ from 'lodash';
import { getJoiNumberSchema as resolveJoiNumberSchema } from "./number";
import { resolveJoiObjectSchema as resolveJoiObjectSchema } from "./object";
import { resolveJoiStringSchema } from "./string";

export function resolveType(schema: JSONSchema4): JoiSchema {
  const getJoiType = (type: JSONSchema4TypeName): JoiSchema => {
    switch(type) {
      case 'array':
        return resolveJoiArraySchema(schema);
        break;
      case 'boolean':
        return createJoiItem('boolean');
        break;
      case 'integer':
      case 'number':
        return resolveJoiNumberSchema(schema);
        break;
      case 'object':
        return resolveJoiObjectSchema(schema);
        break;
      case 'string':
        return resolveJoiStringSchema(schema);
        break;
      case 'null':
        return {
          type: 'any',
          valid: [null],
        };
        break;
    }
    return {
      type: 'any',
    };
  }

  let joiSchema = createJoiItem('any');

  if (_.isArray(schema.type)) {
    const schemas = schema.type.map((type) => getJoiType(type));
    (joiSchema as JoiAlternatives).alternatives = schemas;
  } else if (schema.type) {
    joiSchema = getJoiType(schema.type);
  }

  joiSchema.default = schema.default;
  joiSchema.description = schema.description;
  joiSchema.label = schema.title;

  return joiSchema;
}