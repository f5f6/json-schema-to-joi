
import { createJoiItem, JoiObject, JoiSchema } from './types';
// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import * as _ from 'lodash';
import { resolveJSONSchema } from './resolve';
import { generateAnyJoi, generateJoi, JoiStatement, JoiSpecialChar, openJoi, closeJoi } from './generate';
import { Options } from './options';
import {stringifyOutputString} from '../utils';

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
  } else {
    joiSchema.pattern = [{
      pattern: '^',
      schema: resolveJSONSchema(additionalProperties, options),
    }];
  }
  // https://json-schema.org/understanding-json-schema/reference/object.html#size
  // tslint:disable:no-unused-expression-chai
  if(_.isNumber(schema.minProperties) && _.isNumber(schema.maxProperties) && schema.maxProperties == schema.minProperties) {
    joiSchema.length = schema.maxProperties ;
  }else{
    _.isNumber(schema.minProperties) && (joiSchema.min = schema.minProperties);
    _.isNumber(schema.maxProperties) && (joiSchema.max = schema.maxProperties);
  }
  // tslint:enable:no-unused-expression-chai
  // TODO: Dependencies
  // https://json-schema.org/understanding-json-schema/reference/object.html#dependencies
  if(schema.dependencies !== undefined){
    // the properties which need dependencies
    let dependencies: string[] = _.keys(schema.dependencies);
    const schemaDepencies = schema.dependencies;
    joiSchema.with = {};
    const joiSchemaWith = joiSchema.with;
    dependencies.forEach((key)=>{
      // https://json-schema.org/understanding-json-schema/reference/object.html#dependencies
      if(_.isArray(schemaDepencies[key])){
        const properties:string[] = schemaDepencies[key] as string[];
        joiSchemaWith[key] = properties;
      }else{
        // TODO Joi.with() can't not support object dependencies
        // joiSchemaWith[key] = resolveJSONSchema(schemaDepencies[key],options)
      }
    })
  }
  // TODO: Pattern Properties
  // https://json-schema.org/understanding-json-schema/reference/object.html#pattern-properties
  if(schema.patternProperties !== undefined){
    let propertiesPattern: string[] = _.keys(schema.patternProperties);
    if(joiSchema.pattern === undefined) joiSchema.pattern = [];
    // Compiling will fail without the following two local variable declearations.
    const joiSchemaPattern = joiSchema.pattern;
    const schemaPatternProperties = schema.patternProperties;
    propertiesPattern.forEach((keyPattern:string)=>{
        joiSchemaPattern.push({
          pattern: keyPattern,
          schema: resolveJSONSchema(schemaPatternProperties[keyPattern],options),
        })
    })
  }
  return joiSchema;
}

export function generateObjectJoi(schema: JoiObject): JoiStatement[] {
  const content: JoiStatement[] = openJoi(['Joi.object()']);

  const keys = schema.keys;

  if (keys) {
    const keyWithQuota = _.keys(keys).some((v) => {
      return v.includes('-') || v.includes(' ');
    });
    content.push(...[
      '.keys',
      JoiSpecialChar.OPEN_PAREN,
      JoiSpecialChar.OPEN_BRACE,
      JoiSpecialChar.NEWLINE,
    ]);
    _.keys(keys).forEach((key) => {
      let printKey = key;
      if (keyWithQuota) {
        printKey = '\'' + printKey + '\'';
      }
      content.push(...[
        printKey,
        JoiSpecialChar.COLON,
        ...generateJoi(keys[key]),
        JoiSpecialChar.COMMA,
        JoiSpecialChar.NEWLINE
      ]);
    });
    content.push(...[
      JoiSpecialChar.CLOSE_BRACE,
      JoiSpecialChar.CLOSE_PAREN,
    ]);
  }

  if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }
  if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }
  if (schema.length !== undefined ){
    content.push(`.length(${schema.length})`);
  }
  if (schema.pattern) {
    schema.pattern.forEach((pattern)=>{
      const patternKey = pattern.pattern;
      const subSchema = pattern.schema; // JoiSchema
      content.push(...[
        '.pattern',
        JoiSpecialChar.OPEN_PAREN
      ]);
      if (typeof patternKey == 'string') {
        // patternKey is a regex
        content.push('/'+ patternKey+'/');
      } else {
        content.push(...generateJoi(patternKey));
      }
      content.push(JoiSpecialChar.COMMA);
      
      content.push(...generateJoi(subSchema));
      //content.push(...generateAnyJoi(subSchema));

      content.push(JoiSpecialChar.CLOSE_PAREN);
    });
  }
  if (schema.with){
    const schemaWith = schema.with;
    _.keys(schema.with).forEach((key)=>{
      const dependencies = schemaWith[key];
      content.push(...['.with',JoiSpecialChar.OPEN_PAREN]);
      //content.push(JoiSpecialChar.)
      content.push('\''+key+'\'');

      content.push(JoiSpecialChar.COMMA);

      if(_.isArray(dependencies)){
        content.push(JoiSpecialChar.OPEN_BRACKET);
        content.push(...stringifyOutputString(dependencies));
        content.push(JoiSpecialChar.CLOSE_BRACKET);
      }else{
        // TODO Joi.with() can't not support object dependencies
        //content.push(...generateJoi(dependencies));
      }
      content.push(JoiSpecialChar.CLOSE_PAREN)
    })
  }
  content.push(...generateAnyJoi(schema));

  return closeJoi(content);
}
