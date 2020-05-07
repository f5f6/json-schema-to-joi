import { JoiAny } from './types';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiStatement } from '.';
import * as _ from 'lodash';
import { openJoi, JoiSpecialChar, closeJoi } from './generate';

export function resolveJoiAnyMeta(joiAny: JoiAny, jsonSchema: JSONSchema4): void {
  // tslint:disable: no-unused-expression-chai
  (!!jsonSchema.description) && (joiAny.description = jsonSchema.description);
  (!!jsonSchema.title) && (joiAny.label = _.camelCase(jsonSchema.title));
  // tslint:enable: no-unused-expression-chai
}

export function generateAnyJoi(schema: JoiAny): JoiStatement[] {
  let content: JoiStatement[]
    = (schema.type === 'any') ? openJoi([JoiSpecialChar.IMPORTED_JOI_NAME, 'any()']) : [];
  if (schema.allow) {
    content.push(`.allow(...${JSON.stringify(schema.allow)})`);
  }
  if (schema.valid) {
    content.push(`.valid(...${JSON.stringify(schema.valid)})`);
  }
  if (schema.invalid) {
    content.push(`.invalid(...${JSON.stringify(schema.invalid)})`);
  }

  if (schema.default) {
    content.push(`.default(${JSON.stringify(schema.default)})`);
  }

  content = generateBooleanKeys(schema, content);

  // tslint:disable-next-line: no-commented-code
  // if (schema.description) {
  //   content.push(`.description(${JSON.stringify(schema.description)})`);
  // }

  return (schema.type === 'any') ? closeJoi(content) : content;
}

function generateBooleanKeys(schema: JoiAny, content: JoiStatement[]): JoiStatement[] {
  _.keys(schema).forEach((key) => {
    if (key !== 'default') {
      if (schema[key] === true) {
        content.push(`.${key}()`);
      } else if (schema[key] === false) {
        content.push(`.${key}(false)`);
      }
    }
  });

  return content;
}
