// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { createJoiItem, JoiAllOf } from './types';
import { resolveJSONSchema } from './resolve';
import { openJoi, JoiStatement, closeJoi, JoiSpecialChar, generateJoi } from './generate';
import { Options } from './options';
import * as _ from 'lodash';

export function resolveJoiAllOfSchema(schema: JSONSchema4, options?: Options): JoiAllOf {
  const joiSchema = createJoiItem('allOf') as JoiAllOf;

  joiSchema.items = schema.allOf!.map((item) => {
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

export function generateAllOfJoi(schema: JoiAllOf): JoiStatement[] {
  const content: JoiStatement[] = openJoi(['Joi.extendedJoi.allOf()']);
  content.push(...[
    '.items',
    JoiSpecialChar.OPEN_PAREN,
    JoiSpecialChar.OPEN_BRACKET,
  ]);

  if (schema.items) {
    schema.items.forEach((item) => {
      content.push(...[
        JoiSpecialChar.NEWLINE,
        ...generateJoi(item),
        JoiSpecialChar.COMMA,
      ]);
    });
  }

  content.push(...[
    JoiSpecialChar.NEWLINE,
    JoiSpecialChar.CLOSE_BRACKET,
    JoiSpecialChar.CLOSE_PAREN,
  ]);

  return closeJoi(content);
}
