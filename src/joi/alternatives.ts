// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createJoiItem, JoiAlternatives, JoiAny } from './types';
import { resolveJSONSchema } from './resolve';
import { openJoi, JoiStatement, closeJoi, JoiSpecialChar, generateJoi } from './generate';
import { Options } from './options';

function resolveAnyOf(schemas: JSONSchema4[], options?: Options): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.anyOf = schemas.map((v) => {
    return resolveJSONSchema(v, options);
  });
  return joiSchema;
}

function resolveNot(schema: JSONSchema4, options?: Options): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.not = resolveJSONSchema(schema, options);
  return joiSchema;
}

export function resolveJoiAlternativesSchema(schema: JSONSchema4, options?: Options): JoiAlternatives {
  if (schema.not) {
    return resolveNot(schema.not, options);
  }

  if (schema.anyOf) {
    return resolveAnyOf(schema.anyOf, options);
  }

  return createJoiItem('alternatives') as JoiAlternatives;
}

function generateNot(not: JoiAny): JoiStatement[] {
  const content: JoiStatement[] = openJoi(['Joi.alternatives()']);
  content.push(...[
    '.when',
    JoiSpecialChar.OPEN_PAREN,
    JoiSpecialChar.NEWLINE,
    'Joi.alternatives().try',
    JoiSpecialChar.OPEN_PAREN,
    ...generateJoi(not),
    JoiSpecialChar.CLOSE_PAREN,
    JoiSpecialChar.COMMA,
    JoiSpecialChar.OPEN_BRACE,
    JoiSpecialChar.NEWLINE,
    'then: Joi.any().forbidden()',
    JoiSpecialChar.COMMA,
    JoiSpecialChar.NEWLINE,
    'otherwise: Joi.any(),',
    JoiSpecialChar.NEWLINE,
    JoiSpecialChar.CLOSE_BRACE,
    JoiSpecialChar.CLOSE_PAREN,
  ]);
  return closeJoi(content);
}

function generateAnyOf(anyOf: JoiAny[]): JoiStatement[] {
  const content: JoiStatement[] = openJoi(['Joi.alternatives()']);
  content.push(...[
    '.try',
    JoiSpecialChar.OPEN_PAREN,
  ]);

  anyOf.forEach((schema) => {
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
    return generateAnyOf(schema.anyOf);
  }

  const content: JoiStatement[] = openJoi(['Joi.alternatives()']);
  return closeJoi(content);
}
