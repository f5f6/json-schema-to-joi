import { createJoiItem, JoiArray, JoiSchema } from './types';
import { JSONSchema4 } from 'json-schema';
import * as _ from 'lodash';
import { resolveJSONSchema } from './resolve';

function resolveAsArray(schema: JSONSchema4 | JSONSchema4[]): JoiSchema[] {
  if (_.isArray(schema)) {
    return schema.map((v) => {
      return resolveJSONSchema(v);
    });
  }
  return [resolveJSONSchema(schema)];
}

export function resolveJoiArraySchema(schema: JSONSchema4): JoiArray {
  const joiSchema = createJoiItem('array') as JoiArray;
  const itemCount = 0;
  if (schema.items) {
    const itemsIsArray = _.isArray(schema.items);
    // https://json-schema.org/understanding-json-schema/reference/array.html#items
    const items = resolveAsArray(schema.items);
    if (itemsIsArray) {
      // https://json-schema.org/understanding-json-schema/reference/array.html#tuple-validation
      joiSchema.ordered = items;
      if (schema.additionalItems === false) {
        joiSchema.max = schema.items.length;
      } else if (schema.additionalItems !== true
        && schema.additionalItems !== undefined) {
        joiSchema.items = [resolveJSONSchema(schema.additionalItems)];
      }
    } else {
      // https://json-schema.org/understanding-json-schema/reference/array.html#list-validation
      joiSchema.items = items;
    }
  }

  joiSchema.min = schema.minItems;
  joiSchema.max = schema.maxItems;
  joiSchema.unique = schema.uniqueItems;

  return joiSchema;
}
