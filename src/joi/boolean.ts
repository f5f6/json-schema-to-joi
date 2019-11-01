import { JoiBoolean, createJoiItem } from './types';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { closeJoi, openJoi, JoiStatement, JoiSpecialChar } from './generate';

export function resolveJoiBooleanSchema(_schema: JSONSchema4): JoiBoolean {
  return createJoiItem('boolean');
}

export function generateBooleanJoi(_schema: JoiBoolean): JoiStatement[] {
  const content: JoiStatement[] = openJoi([
    JoiSpecialChar.IMPORTED_JOI_NAME,
    'boolean()'
  ]);
  return closeJoi(content);
}
