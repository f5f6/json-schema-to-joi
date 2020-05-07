// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createJoiItem, JoiAllOf } from './types';
import { resolveJSONSchema } from './resolve';
import { openJoi, JoiStatement, closeJoi, JoiSpecialChar, generateJoiStatement } from './generate';
import { ResolveOptions } from './options';
import { resolveJoiAnyMeta, generateAnyJoi } from './any';

export function resolveJoiAllOfSchema(schema: JSONSchema4, options?: ResolveOptions): JoiAllOf {
  const joiSchema = createJoiItem('allOf') as JoiAllOf;

  joiSchema.items = schema.allOf!.map((item) => {
    if ((item.properties || item.required) && item.type === undefined) {
      item.type = 'object';
    }
    return resolveJSONSchema(item, options);
  });

  resolveJoiAnyMeta(joiSchema, schema);
  return joiSchema;
}

export function generateAllOfJoi(schema: JoiAllOf): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_EXTENDED_JOI_NAME,
    'allOf()'
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
