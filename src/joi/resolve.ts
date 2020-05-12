// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema, JoiReference, JoiAny } from './types';
import { resolveType } from './resolveType';
import { ResolveOptions } from './options';
import { resolveJoiAlternativesSchema } from './alternatives';
import * as _ from 'lodash';
import { resolveJoiOneOfSchema } from './oneOf';
import { resolveJoiAllOfSchema } from './allOf';

// tslint:disable-next-line:naming-convention
export function resolveBundledJSONSchema(schema: JSONSchema4, options?: ResolveOptions): JoiSchema[] {
  const ret: JoiSchema[] = [];
  const map: Map<string, { joiSchema: JoiSchema; dependencies: string[]; }> = new Map();
  let keyOnList: string[] = [];
  const keyDone: string[] = [];
  if (schema.definitions) {
    _.forIn(schema.definitions, (subSchema, key) => {
      const joiSchema = resolveJSONSchema(subSchema, _.assign({}, options, { rootSchema: schema }));
      joiSchema.label = _.camelCase(key);
      map.set(joiSchema.label, {
        joiSchema,
        dependencies: extractDependency(joiSchema),
      });
      keyOnList.push(joiSchema.label);
    });

    const useDeprecatedJoi = options ? options.useDeprecatedJoi : false;

    while (keyOnList.length > 0) {
      const keysToBeRemoved: string[] = [];
      map.forEach((value, key) => {
        value.dependencies = value.dependencies.filter((v) => keyDone.indexOf(v) === -1);
        if (value.dependencies.length === 0 || // All dependencies have been done
          (value.dependencies.length === 1 && _.camelCase(value.dependencies[0]) === key)) { // Only depends on itself
          if (value.dependencies.length === 1) {
            replaceRecursiveReference(value.joiSchema, key, useDeprecatedJoi);
            if (!useDeprecatedJoi) {
              value.joiSchema.id = key;
            }
          }
          ret.push(value.joiSchema);
          keyDone.push(key);
          keyOnList = keyOnList.filter((v) => v !== key);
          keysToBeRemoved.push(key);
        }
      });
      keysToBeRemoved.forEach((key) => {
        map.delete(key);
      });
    }
  }
  return ret;
}

function replaceRecursiveReference(joiSchema: any, key: string, useDeprecatedJoi: boolean = false): void {
  if (((<JoiReference>joiSchema).type === 'reference' && (<JoiReference>joiSchema).$ref === key)) {
    (<JoiReference>joiSchema).type = useDeprecatedJoi ? 'lazy' : 'link';
  }

  _.forIn(joiSchema, (value) => {
    if (_.isArray(value)) {
      value.forEach((item) => {
        replaceRecursiveReference(item, key, useDeprecatedJoi);
      });
    } else if (_.isObject(value)) {
      replaceRecursiveReference(value, key, useDeprecatedJoi);
    }
  });
}

function extractDependency(joiSchema: any): string[] {
  const ret: string[] = [];
  if ((<JoiAny>joiSchema).type === 'reference' && (<JoiReference>joiSchema).$ref) {
    ret.push(_.camelCase((<JoiReference>joiSchema).$ref));
  }

  _.forIn(joiSchema, (value) => {
    if (_.isArray(value)) {
      value.forEach((item) => {
        ret.push(...extractDependency(item));
      });
    } else if (_.isObject(value)) {
      ret.push(...extractDependency(value));
    }
  });
  return ret;
}

// tslint:disable-next-line:naming-convention
export function resolveJSONSchema(schema: JSONSchema4, options?: ResolveOptions): JoiSchema {
  const realOptions: ResolveOptions = _.defaults(options, {
    useDeprecatedJoi: false,
    useExtendedJoi: false,
  });
  // deal with $ref firstly
  if (schema.$ref) {
    const $ref = schema.$ref;
    const paths = $ref.split('/');
    if (paths.length === 3) { // '#/definitions/xxx'
      return {
        type: 'reference',
        $ref: _.camelCase(paths[2]),
        label: schema.title,
        description: schema.description,
      };
    } else if (paths.length > 3) { // '#/definitions/xxx/properties/yyy'
      const rootSchema = realOptions.rootSchema ? realOptions.rootSchema : schema;
      return resolveJSONSchema(<JSONSchema4>_.get(rootSchema, paths.slice(1).join('.')), options);
    }
  }

  if (schema.enum && !schema.type && !schema.format) {
    return {
      type: 'any',
      valid: schema.enum,
      label: schema.title,
      description: schema.description,
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
