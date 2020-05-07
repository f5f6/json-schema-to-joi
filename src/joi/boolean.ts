import { JoiBoolean, createJoiItem } from './types';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { closeJoi, openJoi, JoiStatement, JoiSpecialChar } from './generate';
import { generateAnyJoi, resolveJoiAnyMeta } from './any';

export function resolveJoiBooleanSchema(schema: JSONSchema4): JoiBoolean {
  const joiSchema = createJoiItem('boolean');
  resolveJoiAnyMeta(joiSchema, schema);
  return joiSchema;
}

export function generateBooleanJoi(schema: JoiBoolean): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'boolean()'
  ]);

  content.push(...generateAnyJoi(schema));
  return closeJoi(content);
}
