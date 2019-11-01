// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema } from './types';
import { resolveType } from './resolveType';
import { Options } from './options';
import { resolveJoiAlternativesSchema } from './alternatives';
import { resolveReference } from './reference';
import * as _ from 'lodash';
import { resolveJoiOneOfSchema } from './oneOf';
import { resolveJoiAllOfSchema } from './allOf';

// tslint:disable-next-line:naming-convention
export function resolveJSONSchema(schema: JSONSchema4, options?: Options): JoiSchema {
  const realOptions: Options = _.defaults(options, {
    useDeprecatedJoi: false,
  });
  // deal with $ref firstly
  if (schema.$ref && realOptions) {
    const ref = resolveReference(schema.$ref, realOptions);
    if (ref) {
      return resolveJSONSchema(ref, realOptions);
    }
  }

  if (schema.enum && !schema.type && !schema.format) {
    return {
      type: 'any',
      valid: schema.enum,
    };
  }

  if (schema.anyOf || schema.not) {
    return resolveJoiAlternativesSchema(schema, realOptions);
  }

  if (schema.allOf || schema.oneOf) {
    if (realOptions.useDeprecatedJoi && realOptions.useExtendedJoi) {
      if (schema.allOf) {
        return resolveJoiAllOfSchema(schema, options);
      } else {
        return resolveJoiOneOfSchema(schema, options);
      }
    } else {
      return resolveJoiAlternativesSchema(schema, realOptions);
    }
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
      || schema.patternProperties || schema.dependencies
      || _.isNumber(schema.minProperties) || _.isNumber(schema.maxProperties)) {
      schema.type = 'object';
    } else if (schema.items || _.isNumber(schema.minItems) || _.isNumber(schema.maxItems)
      || schema.uniqueItems || schema.additionalItems) {
      schema.type = 'array';
    } else if (_.isNumber(schema.minLength) || _.isNumber(schema.maxLength) || schema.pattern) {
      schema.type = 'string';
    } else if (_.isNumber(schema.multipleOf)
      || _.isNumber(schema.minimum) || _.isNumber(schema.maximum)) {
      schema.type = 'number';
    } else if (schema.format && [
      'date-time', 'date', 'time', 'email',
      'hostname', 'ipv4', 'ipv6', 'uri',
      'byte', 'binary', 'uuid', 'guid',
    ].includes(schema.format)) {
      schema.type = 'string';
    } else {
      schema.type = 'any';
    }
  }

  return resolveType(schema, realOptions);
}
