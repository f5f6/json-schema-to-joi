// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createJoiItem, JoiAlternatives, JoiAny } from './types';
import { resolveJSONSchema } from './resolve';
import { openJoi, JoiStatement, closeJoi, JoiSpecialChar, generateJoi } from './generate';
import { Options } from './options';

function resolveCombiningSchemas(
  schemas: JSONSchema4[], mode: 'any' | 'all' | 'one' = 'any', options?: Options): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  if (mode === 'all') {
    joiSchema.allOf = schemas.map((v) => resolveJSONSchema(v, options));
  } else if (mode === 'one') {
    joiSchema.oneOf = schemas.map((v) => resolveJSONSchema(v, options));
  } else {
    joiSchema.anyOf = schemas.map((v) => resolveJSONSchema(v, options));
  }
  return joiSchema;
}

function resolveNot(schema: JSONSchema4, options?: Options): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.not = resolveJSONSchema(schema, options);
  return joiSchema;
}

function resolveAnyOf(schemas: JSONSchema4[], options?: Options): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.anyOf = schemas.map((v) => {
    return resolveJSONSchema(v, options);
  });
  return joiSchema;
}

export function resolveJoiAlternativesSchema(schema: JSONSchema4, options?: Options): JoiAlternatives {
  if (schema.not) {
    return resolveNot(schema.not, options);
  }

  if (options && options.useDeprecatedJoi && options.useExtendedJoi) {
    if (schema.anyOf) {
      return resolveAnyOf(schema.anyOf, options);
    }
  } else {
    if (schema.anyOf) {
      return resolveCombiningSchemas(schema.anyOf, 'any', options);
    }

    if (schema.allOf) {
      return resolveCombiningSchemas(schema.allOf, 'all', options);
    }

    if (schema.oneOf) {
      return resolveCombiningSchemas(schema.oneOf, 'one', options);
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
    JoiSpecialChar.NEWLINE,
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'alternatives().try',
    JoiSpecialChar.OPEN_PAREN,
    ...generateJoi(not),
    JoiSpecialChar.CLOSE_PAREN,
    JoiSpecialChar.COMMA,
    JoiSpecialChar.OPEN_BRACE,
    JoiSpecialChar.NEWLINE,
    'then: ',
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'any().forbidden()',
    JoiSpecialChar.COMMA,
    JoiSpecialChar.NEWLINE,
    'otherwise: ',
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'any(),',
    JoiSpecialChar.NEWLINE,
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
      JoiSpecialChar.NEWLINE,
      ...generateJoi(schema),
      JoiSpecialChar.COMMA,
    ]);
  });

  content.push(...[
    JoiSpecialChar.NEWLINE,
    JoiSpecialChar.CLOSE_PAREN,
  ]);
  return closeJoi(content);
}

export function generateAlternativesJoi(schema: JoiAlternatives): JoiStatement[] {
  if (schema.not) {
    return generateNot(schema.not);
  }

  if (schema.anyOf) {
    return generateCombineSchema(schema.anyOf, 'any');
  }

  if (schema.allOf) {
    return generateCombineSchema(schema.allOf, 'all');
  }

  if (schema.oneOf) {
    return generateCombineSchema(schema.oneOf, 'one');
  }

  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'alternatives()'
  ]);
  return closeJoi(content);
}
