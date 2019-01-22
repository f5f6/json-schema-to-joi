import { JoiType, createJoiItem, JoiArray, JoiSchema } from "./types";
import { JSONSchema4 } from "json-schema";
import * as _ from 'lodash';
import { resolve } from "./resolve";

function resolveAsArray(schema: JSONSchema4 | JSONSchema4[]): JoiSchema[] {
  if (_.isArray(schema)) {
    return schema.map((v) => resolve(v));
  }
  return [resolve(schema)];
}

export function getJoiArraySchema(schema: JSONSchema4): JoiArray {
  const joiSchema = createJoiItem('array') as JoiArray;
  if (schema.items) {
    joiSchema.items = resolveAsArray(schema.items);
  }

  if (schema.items && schema.additionalItems === false) {
    joiSchema.max = schema.items.length;
  }

  joiSchema.min = schema.minItems;
  joiSchema.max = schema.maxItems;
  joiSchema.unique = schema.uniqueItems;

  return joiSchema;
}