// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createJoiItem, JoiOneOf } from './types';
import { resolveJSONSchema } from './resolve';
import { openJoi, JoiStatement, closeJoi, JoiSpecialChar, generateJoiStatement } from './generate';
import { Options } from './options';
import * as _ from 'lodash';

export function resolveJoiOneOfSchema(schema: JSONSchema4, options?: Options): JoiOneOf {
  const joiSchema = createJoiItem('oneOf') as JoiOneOf;

  joiSchema.items = schema.oneOf!.map((item) => {
    if ((item.properties || item.required) && item.type === undefined) {
      item.type = 'object';
    }
    return resolveJSONSchema(item, options);
  });

  // tslint:disable:no-unused-expression-chai
  (!!schema.description) && (joiSchema.description = schema.description);
  (!!schema.title) && (joiSchema.label = _.camelCase(schema.title));
  // tslint:enable:no-unused-expression-chai
  return joiSchema;
}

export function generateOneOfJoi(schema: JoiOneOf): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
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
  ]);

  return closeJoi(content);
}
