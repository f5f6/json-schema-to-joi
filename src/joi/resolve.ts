// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema } from './types';
import { resolveType } from './resolveType';
import { Options } from './options';
import { resolveJoiAlternativesSchema } from './alternatives';
import { resolveReference } from './reference';
import * as _ from 'lodash';

// tslint:disable-next-line:naming-convention
export function resolveJSONSchema(schema: JSONSchema4, options?: Options): JoiSchema {
  // deal with $ref firstly
  if (schema.$ref && options) {
    const ref = resolveReference(schema.$ref, options);
    if (ref) {
      return resolveJSONSchema(ref, options);
    }
  }

  if (schema.enum) {
    return {
      type: 'any',
      valid: schema.enum,
    };
  }

  if (schema.anyOf || schema.not || schema.allOf || schema.oneOf) {
    return resolveJoiAlternativesSchema(schema, options);
  }

  if (_.isArray(schema.type) && schema.type.length > 0) {
    return resolveJSONSchema({
      anyOf: schema.type.map((type) => {
        return { type, };
      }),
    });
  }

  if (!schema.type) {
    if (schema.required !== undefined || schema.properties
      || schema.patternProperties
      || _.isNumber(schema.minProperties) || _.isNumber(schema.maxProperties)) {
      schema.type = 'object';
    } else if (schema.items || _.isNumber(schema.minItems) || _.isNumber(schema.maxItems)
      || schema.uniqueItems || schema.additionalItems) {
      schema.type = 'array';
    } else if (_.isNumber(schema.minLength) || _.isNumber(schema.maxLength) || schema.pattern) {
      schema.type = 'string';
    } else if (_.isNumber(schema.multipleOf)
      || _.isNumber(schema.minimum) || _.isNumber(schema.exclusiveMinimum)
      || _.isNumber(schema.maximum) || _.isNumber(schema.exclusiveMaximum)) {
      schema.type = 'number';
    } else {
      schema.type = 'any';
    }
  }

  return resolveType(schema, options);
}
