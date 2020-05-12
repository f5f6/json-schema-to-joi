import * as prettier from 'prettier';
import { JoiStatement, JoiSpecialChar } from './generate';
import { FormatOptions } from './options';
import * as _ from 'lodash';

export function formatJoi(statements: JoiStatement[], options?: FormatOptions): string {
  let title: string = '';
  let result = '';
  let skipStringForTitleOrRefer = false;
  const semi = false;

  const importedJoiName = (options ? options.joiName : 'Joi') || 'Joi';
  const importedExtendedJoiName = (options ? options.extendedJoiName : 'extendedJoi') || 'extendedJoi';
  const withExport = options ? options.withExport : false;

  statements.forEach((statement, i, all) => {
    if (typeof statement === 'string') {
      if (skipStringForTitleOrRefer) {
        skipStringForTitleOrRefer = false; // Reset as it is possible to have multiple references
        // or one tile plus reference
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
          skipStringForTitleOrRefer = true;
          title = <string>all[i + 1];
          const close = all[i + 2];
          if (typeof title !== 'string' || close !== JoiSpecialChar.CLOSE_TITLE) {
            throw new Error('title not exist');
          }
          result += `${withExport ? 'export' : ''} const ${title}JoiSchema = `;
          break;
        case JoiSpecialChar.CLOSE_TITLE:
          skipStringForTitleOrRefer = false;
          break;
        case JoiSpecialChar.IMPORTED_JOI_NAME:
          result += importedJoiName + '.';
          break;
        case JoiSpecialChar.IMPORTED_EXTENDED_JOI_NAME:
          result += importedExtendedJoiName + '.';
          break;
        case JoiSpecialChar.REFERENCE:
        case JoiSpecialChar.LAZY:
        case JoiSpecialChar.LINK:
          let referKey = all[i + 1];
          skipStringForTitleOrRefer = true;
          if (typeof referKey !== 'string') {
            throw new Error('reference has no key');
          }
          const id = JSON.stringify('#' + referKey);
          referKey += 'JoiSchema';
          if (statement === JoiSpecialChar.LAZY) {
            result += `${importedJoiName}.lazy(() => ${referKey})`;
          } else if (statement === JoiSpecialChar.LINK) {
            result += `${importedJoiName}.link(${id})`;
          } else {
            result += referKey;
          }
          break;
      }
    }
  });

  const prettierOptions: prettier.Options = _.defaults(
    {},
    options ? options.prettierOptions : {}, {
    tabWidth: 2,
    useTabs: false,
    singleQuote: true,
    trailingComma: 'all',
    semi,
    parser: 'typescript',
    printWidth: 80,
  });

  return prettier.format(result, prettierOptions);
}
