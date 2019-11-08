import { JoiBoolean, createJoiItem } from './types';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { closeJoi, openJoi, JoiStatement, JoiSpecialChar, generateAnyJoi } from './generate';

export function resolveJoiBooleanSchema(_schema: JSONSchema4): JoiBoolean {
  return createJoiItem('boolean');
}

export function generateBooleanJoi(schema: JoiBoolean): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'boolean()'
  ]);

  content.push(...generateAnyJoi(schema));
  return closeJoi(content);
}
