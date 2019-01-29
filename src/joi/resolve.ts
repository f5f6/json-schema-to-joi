// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema } from './types';
import { resolveType } from './resolveType';
import { Options } from './options';
import { resolveJoiAlternativesSchema } from './alternatives';
import { resolveReference } from './reference';

// tslint:disable-next-line:naming-convention
export function resolveJSONSchema(schema: JSONSchema4, options?: Options): JoiSchema {
  if (schema.type) {
    return resolveType(schema, options);
  }
  if (schema.anyOf || schema.not) {
    return resolveJoiAlternativesSchema(schema, options);
  }

  // TODO schema.allOf

  // TODO schema.oneof

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

  return {
    type: 'any'
  };
}
