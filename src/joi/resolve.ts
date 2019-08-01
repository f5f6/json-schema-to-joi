// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema } from './types';
import { resolveType } from './resolveType';
import { Options } from './options';
import { resolveJoiAlternativesSchema } from './alternatives';
import { resolveReference } from './reference';
import { resolveJoiAllOfSchema } from './allOf';
import { resolveJoiOneOfSchema } from './oneOf';

// tslint:disable-next-line:naming-convention
export function resolveJSONSchema(schema: JSONSchema4, options?: Options): JoiSchema {
  // deal with $ref firstly
  if (schema.$ref && options) {
    const ref = resolveReference(schema.$ref, options);
    if (ref) {
      return resolveJSONSchema(ref, options);
    }
  }

  // if schema.required or schema.propteries exists, it implies that it is an object
  if ((schema.required || schema.properties) && !schema.type) {
    schema.type = 'object';
  }

  if (schema.type) {
    return resolveType(schema, options);
  }
  if (schema.anyOf || schema.not) {
    return resolveJoiAlternativesSchema(schema, options);
  }

  if (schema.allOf) {
    return resolveJoiAllOfSchema(schema, options);
  }

  if (schema.oneOf) {
    return resolveJoiOneOfSchema(schema, options);
  }

  if (schema.enum) {
    return {
      type: 'any',
      valid: schema.enum,
    };
  }

  return {
    type: 'any'
  };
}
