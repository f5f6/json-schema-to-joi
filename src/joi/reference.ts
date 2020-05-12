import { JoiReference } from './types';
import { JoiStatement, openJoi, JoiSpecialChar, closeJoi } from './generate';
import { generateAnyJoi } from './any';

export function generateReferenceJoi(schema: JoiReference): JoiStatement[] {
  let startChar = JoiSpecialChar.REFERENCE;
  switch (schema.type) {
    case 'lazy':
      startChar = JoiSpecialChar.LAZY;
      break;
    case 'link':
      startChar = JoiSpecialChar.LINK;
      break;
  }

  const content = openJoi([
    startChar,
    schema.$ref,
  ]);

  content.push(...generateAnyJoi(schema));

  return closeJoi(content);
}
