// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4, JSONSchema4TypeName } from 'json-schema';
import { JoiSchema, createJoiItem, JoiAlternatives } from './types';
import { resolveJoiArraySchema } from './array';
import * as _ from 'lodash';
import { resolveJoiNumberSchema } from './number';
import { resolveJoiObjectSchema } from './object';
import { resolveJoiStringSchema } from './string';
import { resolveJoiBooleanSchema } from './boolean';
import { ResolveOptions } from './options';

export function resolveType(schema: JSONSchema4, options?: ResolveOptions): JoiSchema {
  const getJoiType = (type: JSONSchema4TypeName): JoiSchema => {
    switch (type) {
      case 'array':
        return resolveJoiArraySchema(schema, options);
        break;
      case 'boolean':
        return resolveJoiBooleanSchema(schema);
        break;
      case 'integer':
      case 'number':
        return resolveJoiNumberSchema(schema);
        break;
      case 'object':
        return resolveJoiObjectSchema(schema, options);
        break;
      case 'string':
        return resolveJoiStringSchema(schema);
        break;
      case 'null':
        return {
          type: 'any',
          // tslint:disable-next-line:no-null-keyword
          valid: [null],
        };
        break;
    }
    return {
      type: 'any',
    };
  };

  let joiSchema = createJoiItem('any');

  if (_.isArray(schema.type)) {
    const schemas = schema.type.map(getJoiType);
    joiSchema.type = 'alternatives';
    (joiSchema as JoiAlternatives).alternatives = schemas;
  } else if (schema.type) {
    joiSchema = getJoiType(schema.type);
  }

  // tslint:disable:no-unused-expression-chai
  (!_.isUndefined(schema.default)) && (joiSchema.default = schema.default);
  (!!schema.description) && (joiSchema.description = schema.description);
  (!!schema.title) && (joiSchema.label = _.camelCase(schema.title));
  // tslint:enable:no-unused-expression-chai

  if (schema.enum) {
    joiSchema.valid = schema.enum;
  }

  return joiSchema;
}
