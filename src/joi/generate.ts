import { JoiSchema, JoiObject, JoiString, JoiAny, JoiNumber } from './types';
import * as _ from 'lodash';
import { generateStringJoi } from './string';
import { generateNumberJoi } from './number';
import { generateObjectJoi } from './object';

export function generate(schema: JoiSchema, level: number = 0): string {
  let content: string = '';
  let realSchema;
  switch (schema.type) {
    case 'object':
      content = generateObjectJoi(schema as JoiString, level)
      break;
    case 'string':
      content = generateStringJoi(schema as JoiString, level);
      break;
    case 'number':
      content = generateNumberJoi(schema as JoiNumber, level);
      break;
  }
  return (level === 0 ? `const ${schema.label!}Schema = ` : '') + content;
}

export function getTailChar(level: number): string {
  return level ? ',' : ';';
}

export function generateAnyJoi(schema: JoiAny, level: number = 0): string {
  const head = schema.type === 'any' ? 'Joi.any()' : '';
  const tail = schema.type === 'any' ? getTailChar(level) : '';
  let content = '';
  if (schema.allow) {
    content += `.allow(${JSON.stringify(schema.allow)})`;
  }
  if (schema.valid) {
    content += `.valid(${JSON.stringify(schema.valid)})`;
  }
  if (schema.invalid) {
    content += `.invalid(${JSON.stringify(schema.invalid)})`;
  }

  if (schema.required) {
    content += `.required()`;
  }

  if (schema.optional) {
    content += `.optional()`;
  }

  if (schema.default) {
    content += `.default(${JSON.stringify(schema.default)})`;
  }

  if (schema.description) {
    content += `.description(${JSON.stringify(schema.description)})`;
  }

  return head + content + tail;
}