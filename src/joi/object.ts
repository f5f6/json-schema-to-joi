
import { createJoiItem, JoiObject, JoiSchema } from './types';
// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import * as _ from 'lodash';
import { resolveJSONSchema } from './resolve';
import { generateAnyJoi, generateJoiStatement, JoiStatement, JoiSpecialChar, openJoi, closeJoi } from './generate';
import { Options } from './options';

function resolveProperties(schema: JSONSchema4, options?: Options): { [k: string]: JoiSchema } | undefined {
  const properties = schema.properties;
  if (!properties) {
    if (schema.required) {
      const requiredPropertiesSchema: { [k: string]: JoiSchema } = {};
      schema.required.forEach((key) => {
        requiredPropertiesSchema[key] = createJoiItem('any');
        requiredPropertiesSchema[key].required = true;
      });
      return requiredPropertiesSchema;
    } else {
      return undefined;
    }
  }

  const propertiesSchema = _.mapValues(properties, (property, key) => {
    const joiSchema = resolveJSONSchema(property, options);
    // https://json-schema.org/understanding-json-schema/reference/object.html#required-properties
    const required = (schema.required && schema.required.includes(key));
    if (required) {
      joiSchema.required = true;
    }
    return joiSchema;
  });

  if (schema.required) {
    schema.required.forEach((key) => {
      if (!properties[key]) {
        propertiesSchema[key] = createJoiItem('any');
        propertiesSchema[key].required = true;
      }
    });
  }

  return propertiesSchema;
}

export function resolveJoiObjectSchema(schema: JSONSchema4, options?: Options): JoiObject {
  const joiSchema = createJoiItem('object') as JoiObject;
  // https://json-schema.org/understanding-json-schema/reference/object.html#properties
  joiSchema.keys = resolveProperties(schema, options);
  let additionalProperties = schema.additionalProperties;
  if (additionalProperties === undefined) {
    additionalProperties = true;
  }
  if (typeof additionalProperties === 'boolean') {
    joiSchema.unknown = additionalProperties;
  }

  // https://json-schema.org/understanding-json-schema/reference/object.html#size
  const minProperties = schema.minProperties;
  const maxProperties = schema.maxProperties;

  if (minProperties !== undefined) {
    if (minProperties === maxProperties) {
      joiSchema.length = minProperties;
    } else {
      joiSchema.min = minProperties;
    }
  }

  if (maxProperties !== undefined) {
    if (minProperties === maxProperties) {
      joiSchema.length = maxProperties;
    } else {
      joiSchema.max = maxProperties;
    }
  }

  // https://json-schema.org/understanding-json-schema/reference/object.html#dependencies
  if (schema.dependencies) {
    _.forIn(schema.dependencies, (dependency, key) => {
      if (_.isArray(dependency)) {
        if (!joiSchema.with) {
          joiSchema.with = {};
        }
        joiSchema.with[key] = dependency;
      } else {
        if (dependency.required && _.isArray(dependency.required)) {
          if (!joiSchema.with) {
            joiSchema.with = {};
          }
          joiSchema.with[key] = dependency.required;
        }
        if (dependency.properties) {
          const extraDependency = _.clone(dependency);
          extraDependency.required = undefined;
          const extraProperties = resolveProperties(extraDependency, options);
          joiSchema.keys = _.assign(joiSchema.keys, extraProperties);
        }
      }
    });
  }

  //   https://json-schema.org/understanding-json-schema/reference/object.html#pattern-properties
  if (schema.patternProperties) {
    if (!joiSchema.patterns) {
      joiSchema.patterns = [];
    }
    const pattern = joiSchema.patterns;
    _.forIn(schema.patternProperties, (patternProperty, key) => {
      pattern.push({
        targetPattern: key,
        schema: resolveJSONSchema(patternProperty),
      });
    });
  }

  if (typeof schema.additionalProperties !== 'boolean' && schema.additionalProperties) {
    if (!joiSchema.patterns) {
      joiSchema.patterns = [];
    }
    joiSchema.patterns.push({
      targetPattern: '^',
      schema: resolveJSONSchema(schema.additionalProperties, options),
    });
  }

  return joiSchema;
}

export function generateObjectJoi(schema: JoiObject): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'object()'
  ]);

  const keys = schema.keys;

  if (keys) {
    const keyWithQuota = _.keys(keys).some((v: string) => {
      return v.includes('-') || v.includes(' ');
    });
    content.push(...[
      '.keys',
      JoiSpecialChar.OPEN_PAREN,
      JoiSpecialChar.OPEN_BRACE,
    ]);
    _.keys(keys).forEach((key) => {
      let printKey = key;
      if (keyWithQuota) {
        printKey = '\'' + printKey + '\'';
      }
      content.push(...[
        printKey,
        JoiSpecialChar.COLON,
        ...generateJoiStatement(keys[key]),
        JoiSpecialChar.COMMA,
      ]);
    });
    content.push(...[
      JoiSpecialChar.CLOSE_BRACE,
      JoiSpecialChar.CLOSE_PAREN,
    ]);
  }

  if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }

  if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }

  if (schema.length !== undefined) {
    content.push(`.length(${schema.length})`);
  }

  if (schema.with) {
    _.forIn(schema.with, (peers, key) => {
      content.push(`.with('${key}', ['${peers.join(',')}'])`);
    });
  }

  if (schema.patterns) {
    schema.patterns.forEach((pattern) => {
      const target = pattern.targetPattern;
      const subSchema = pattern.schema;
      content.push(...[
        '.pattern',
        JoiSpecialChar.OPEN_PAREN,
      ]);
      if (typeof target === 'string') {
        content.push('/' + target + '/');
      } else {
        content.push(...generateJoiStatement(target));
      }
      content.push(JoiSpecialChar.COMMA);

      content.push(...generateJoiStatement(subSchema));

      content.push(JoiSpecialChar.CLOSE_PAREN);
    });
  }

  content.push(...generateAnyJoi(schema));

  return closeJoi(content);
}
