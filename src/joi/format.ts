import { JoiStatement, JoiSpecialChar, OPEN, CLOSE, OPEN_CLOSE } from './generate';
import { createLogger } from '../common/logger';

const logger = createLogger('format');

let level = 0;

export interface Options {
  importedJoiName?: string;
  importedExtendedJoiName?: string;
}

function processLevelSpecialChar(statements: JoiStatement[], i: number): string {
  const char = statements[i];
  const nextChar = statements[i + 1];
  const prevChar = statements[i - 1];
  if (typeof char === 'string') {
    return '';
  }

  if (!OPEN_CLOSE.includes(char)) {
    return '';
  }

  let ret = '';
  let head = '';

  logger.debug({
    char, nextChar, level,
  });

  switch (char) {
    case JoiSpecialChar.OPEN_PAREN:
      // tslint:disable:no-unused-expression-chai
      OPEN.includes(nextChar as JoiSpecialChar) || level++;
      ret = '(';
      break;
    case JoiSpecialChar.CLOSE_PAREN:
      // tslint:disable:no-unused-expression-chai
      CLOSE.includes(nextChar as JoiSpecialChar) || level--;
      ret = ')';
      break;
    case JoiSpecialChar.OPEN_BRACKET:
      // tslint:disable:no-unused-expression-chai
      OPEN.includes(nextChar as JoiSpecialChar) || level++;
      ret = '[';
      break;
    case JoiSpecialChar.CLOSE_BRACKET:
      // tslint:disable:no-unused-expression-chai
      CLOSE.includes(nextChar as JoiSpecialChar) || level--;
      ret = ']';
      break;
    case JoiSpecialChar.OPEN_BRACE:
      // tslint:disable:no-unused-expression-chai
      OPEN.includes(nextChar as JoiSpecialChar) || level++;
      ret = '{';
      break;
    case JoiSpecialChar.CLOSE_BRACE:
      // tslint:disable:no-unused-expression-chai
      CLOSE.includes(nextChar as JoiSpecialChar) || level--;
      if (prevChar === JoiSpecialChar.NEWLINE && level > 0) {
        head = '  '.repeat(level - 1);
      }
      ret = '}';
      break;
  }

  return head + ret;
}

export function formatJoi(statements: JoiStatement[], options?: Options): string {
  let title;
  let result = '';
  let titleSector = false;
  level = 0;

  const importedJoiName = (options ? options.importedJoiName : 'Joi') || 'Joi';
  const importedExtendedJoiName = (options ? options.importedExtendedJoiName : 'extendedJoi') || 'extendedJoi';

  statements.forEach((statement, i, all) => {
    if (typeof statement === 'string') {
      if (titleSector) {
        return;
      }
      result += statement;
    } else {
      const nextChar = all[i + 1];
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
        case JoiSpecialChar.OPEN_BRACE:
        case JoiSpecialChar.OPEN_BRACKET:
        case JoiSpecialChar.OPEN_PAREN:
        case JoiSpecialChar.CLOSE_BRACE:
        case JoiSpecialChar.CLOSE_BRACKET:
        case JoiSpecialChar.CLOSE_PAREN:
          result += processLevelSpecialChar(statements, i);
          break;
        case JoiSpecialChar.COMMA:
          result += ',';
          if (nextChar >= JoiSpecialChar.OPEN_BRACE && nextChar <= JoiSpecialChar.OPEN_PAREN) {
            result += ' ';
          }
          break;
        case JoiSpecialChar.COLON:
          result += ': ';
          break;
        case JoiSpecialChar.NEWLINE:
          result += '\n';
          if (level > 0 &&
            (typeof (nextChar) === 'string'
              || nextChar === JoiSpecialChar.OPEN_JOI
              || nextChar === JoiSpecialChar.IMPORTED_JOI_NAME)) {
            result += '  '.repeat(level);
          }
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
  result = result.trim();
  if (title) {
    result += ';';
  }
  return result.replace(/\"/g, '\'');
}
