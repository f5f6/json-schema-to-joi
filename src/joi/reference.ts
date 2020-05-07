import { JoiReference } from './types';
import { JoiStatement, openJoi, JoiSpecialChar, closeJoi } from './generate';
import { generateAnyJoi } from './any';

export function generateReferenceJoi(schema: JoiReference): JoiStatement[] {
  const content = openJoi([
    JoiSpecialChar.REFERENCE,
    schema.$ref,
  ]);

  content.push(...generateAnyJoi(schema));

  return closeJoi(content);
}
