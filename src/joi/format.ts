import * as prettier from 'prettier';
import { JoiStatement, JoiSpecialChar } from './generate';
import { FormatOptions } from './options';

export function formatJoi(statements: JoiStatement[], options?: FormatOptions): string {
  let title;
  let result = '';
  let titleSector = false;

  const importedJoiName = (options ? options.joiName : 'Joi') || 'Joi';
  const importedExtendedJoiName = (options ? options.extendedJoiName : 'extendedJoi') || 'extendedJoi';

  statements.forEach((statement, i, all) => {
    if (typeof statement === 'string') {
      if (titleSector) {
        return;
      }
      result += statement;
    } else {
      switch (statement) {
        case JoiSpecialChar.OPEN_JOI:
          break;
        case JoiSpecialChar.CLOSE_JOI:
          break;
        case JoiSpecialChar.OPEN_TITLE:
          titleSector = true;
          title = all[i + 1];
          const close = all[i + 2];
          if (typeof title !== 'string' || close !== JoiSpecialChar.CLOSE_TITLE) {
            throw new Error('title not exist');
          }
          result += `const ${title}JoiSchema = `;
          break;
        case JoiSpecialChar.CLOSE_TITLE:
          titleSector = false;
          break;
        case JoiSpecialChar.IMPORTED_JOI_NAME:
          result += importedJoiName + '.';
          break;
        case JoiSpecialChar.IMPORTED_EXTENDED_JOI_NAME:
          result += importedExtendedJoiName + '.';
          break;
      }
    }
  });

  if (title) {
    result += ';';
  }
  return prettier.format(result, {
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'all',
    semi: false,
    parser: 'typescript'
  }).trim();
}
