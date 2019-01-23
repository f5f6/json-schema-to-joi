import { JoiStatement, JoiSpecialChar } from './generate';


let level = 0;
let joiLevel = 0;
let parenLevel = 0;
let bracketLevel = 0;
let braceLevel = 0;

enum Status {
  BRACE,
  BRACKET,
  PAREN,
}

const status: Status[] = [];


function processLevelSpecialChar(statements: JoiStatement[], i: number): string {
  const char = statements[i];
  const prevChar = statements[i - 1];
  let newLine = true;
  if (typeof char === 'string') {
    return '';
  }

  if (char < JoiSpecialChar.LEVEL_S || char > JoiSpecialChar.LEVEL_E) {
    return '';
  }

  if ((prevChar === undefined) || typeof prevChar === 'string' || 
    prevChar > JoiSpecialChar.LEVEL_E || prevChar < JoiSpecialChar.LEVEL_S) {
    newLine = false;
  }

  let ret = '';

  switch (char) {
    case JoiSpecialChar.OPEN_PAREN:
      newLine && level++;
      parenLevel++;
      ret = '(';
      status.push(Status.BRACE);
      break;
    case JoiSpecialChar.CLOSE_PAREN:
      newLine && level--;
      parenLevel--;
      ret = ')';
      status.pop();
      break;
    case JoiSpecialChar.OPEN_BRACKET:
      newLine && level++;
      bracketLevel++;
      ret = '[';
      status.push(Status.BRACKET);
      break;
    case JoiSpecialChar.CLOSE_BRACKET:
      newLine && level--;
      bracketLevel--;
      ret = ']';
      status.pop();
      break;
    case JoiSpecialChar.OPEN_BRACE:
      newLine && level++;
      braceLevel++;
      ret = '{';
      status.push(Status.BRACE);
      break;
    case JoiSpecialChar.CLOSE_BRACE:
      newLine && level--;
      braceLevel--;
      ret = '}';
      status.pop();
      break;
  }
  let tail = '';
  
  if (newLine) {
    tail = '\n' + '  '.repeat(level);
  }
  
  return ret + tail;
}

export function formatJoi(statements: JoiStatement[]): string {
  let title;
  let result = '';
  let titleSector = false;

  statements.forEach((statement, i, all) => {
    if (typeof statement === 'string') {
      if (titleSector) {
        return;
      }
      result += statement;
    } else {
      switch (statement) {
        case JoiSpecialChar.OPEN_JOI:
          joiLevel++;
          break;
        case JoiSpecialChar.CLOSE_JOI:
          joiLevel--;
          break;
        case JoiSpecialChar.OPEN_TITLE:
          titleSector = true;
          title = all[i + 1];
          const close = all[i + 2];
          if (typeof title !== 'string' || close !== JoiSpecialChar.CLOSE_TITLE) {
            throw new Error('tile not exist');
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
          result += ',\n';
          if (typeof statements[i + 1] === 'string') {
            result += '  '.repeat(level);
          }
          break;
        case JoiSpecialChar.COLON:
          result += ': ';
          break;

      }
    }
  });
  result = result.trim();
  result += ';';
  return result.replace(/\"/g, '\'');
}