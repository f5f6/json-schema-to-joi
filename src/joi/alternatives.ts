// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createJoiItem, JoiAlternatives, JoiAny } from './types';
import { resolveJSONSchema } from './resolve';
import { openJoi, JoiStatement, closeJoi, JoiSpecialChar, generateJoiStatement } from './generate';
import { ResolveOptions } from './options';
import { resolveJoiAnyMeta, generateAnyJoi } from './any';

function resolveCombiningSchemas(
  schemas: JSONSchema4[], parentSchema: JSONSchema4,
  mode: 'any' | 'all' | 'one' = 'any', options?: ResolveOptions): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  if (mode === 'all') {
    joiSchema.allOf = schemas.map((v) => resolveJSONSchema(v, options));
  } else if (mode === 'one') {
    joiSchema.oneOf = schemas.map((v) => resolveJSONSchema(v, options));
  } else {
    joiSchema.anyOf = schemas.map((v) => resolveJSONSchema(v, options));
  }

  resolveJoiAnyMeta(joiSchema, parentSchema);
  return joiSchema;
}

function resolveNot(schema: JSONSchema4, parentSchema: JSONSchema4, options?: ResolveOptions): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.not = resolveJSONSchema(schema, options);
  resolveJoiAnyMeta(joiSchema, parentSchema);
  return joiSchema;
}

function resolveAnyOf(schemas: JSONSchema4[], parentSchema: JSONSchema4, options?: ResolveOptions): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.anyOf = schemas.map((v) => {
    return resolveJSONSchema(v, options);
  });
  resolveJoiAnyMeta(joiSchema, parentSchema);
  return joiSchema;
}

export function resolveJoiAlternativesSchema(schema: JSONSchema4, options?: ResolveOptions): JoiAlternatives {

  if (schema.not) {
    return resolveNot(schema.not, schema, options);
  }

  if (options && options.useDeprecatedJoi && options.useExtendedJoi) {
    if (schema.anyOf) {
      return resolveAnyOf(schema.anyOf, schema, options);
    }
  } else {
    if (schema.anyOf) {
      return resolveCombiningSchemas(schema.anyOf, schema, 'any', options);
    }

    if (schema.allOf) {
      return resolveCombiningSchemas(schema.allOf, schema, 'all', options);
    }

    if (schema.oneOf) {
      return resolveCombiningSchemas(schema.oneOf, schema, 'one', options);
    }
  }

  return createJoiItem('alternatives') as JoiAlternatives;
}

function generateNot(not: JoiAny): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'any()',
  ]);
  content.push(...[
    '.when',
    JoiSpecialChar.OPEN_PAREN,
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'alternatives().try',
    JoiSpecialChar.OPEN_PAREN,
    ...generateJoiStatement(not),
    JoiSpecialChar.CLOSE_PAREN,
    JoiSpecialChar.COMMA,
    JoiSpecialChar.OPEN_BRACE,
    'then: ',
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'any().forbidden()',
    JoiSpecialChar.COMMA,
    'otherwise: ',
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'any(),',
    JoiSpecialChar.CLOSE_BRACE,
    JoiSpecialChar.CLOSE_PAREN,
  ]);
  return closeJoi(content);
}

function generateCombineSchema(schemas: JoiAny[], mode: 'all' | 'one' | 'any'): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'alternatives()'
  ]);

  if (mode !== 'any') {
    content.push(...[
      `.match('${mode}')`,
    ]);
  }

  content.push(...[
    '.try',
    JoiSpecialChar.OPEN_PAREN,
  ]);

  schemas.forEach((schema) => {
    content.push(...[
      ...generateJoiStatement(schema),
      JoiSpecialChar.COMMA,
    ]);
  });

  content.push(...[
    JoiSpecialChar.CLOSE_PAREN,
  ]);
  return closeJoi(content);
}

export function generateAlternativesJoi(schema: JoiAlternatives): JoiStatement[] {
  let content: JoiStatement[];
  if (schema.not) {
    content = generateNot(schema.not);
  } else if (schema.anyOf) {
    content = generateCombineSchema(schema.anyOf, 'any');
  } else if (schema.allOf) {
    content = generateCombineSchema(schema.allOf, 'all');
  } else if (schema.oneOf) {
    content = generateCombineSchema(schema.oneOf, 'one');
  } else {
    content = openJoi([
      JoiSpecialChar.IMPORTED_JOI_NAME,
      'alternatives()'
    ]);
  }

  content.push(...generateAnyJoi(schema));
  return closeJoi(content);
}
