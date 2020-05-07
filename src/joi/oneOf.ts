// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createJoiItem, JoiOneOf } from './types';
import { resolveJSONSchema } from './resolve';
import { openJoi, JoiStatement, closeJoi, JoiSpecialChar, generateJoiStatement } from './generate';
import { ResolveOptions } from './options';
import { resolveJoiAnyMeta, generateAnyJoi } from './any';

export function resolveJoiOneOfSchema(schema: JSONSchema4, options?: ResolveOptions): JoiOneOf {
  const joiSchema = createJoiItem('oneOf') as JoiOneOf;

  joiSchema.items = schema.oneOf!.map((item) => {
    if ((item.properties || item.required) && item.type === undefined) {
      item.type = 'object';
    }
    return resolveJSONSchema(item, options);
  });

  resolveJoiAnyMeta(joiSchema, schema);
  return joiSchema;
}

export function generateOneOfJoi(schema: JoiOneOf): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_EXTENDED_JOI_NAME,
    'oneOf()'
  ]);
  content.push(...[
    '.items',
    JoiSpecialChar.OPEN_PAREN,
    JoiSpecialChar.OPEN_BRACKET,
  ]);

  if (schema.items) {
    schema.items.forEach((item) => {
      content.push(...[
        ...generateJoiStatement(item),
        JoiSpecialChar.COMMA,
      ]);
    });
  }

  content.push(...[
    JoiSpecialChar.CLOSE_BRACKET,
    JoiSpecialChar.CLOSE_PAREN,
    ...generateAnyJoi(schema),
  ]);

  return closeJoi(content);
}
