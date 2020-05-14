import * as _ from 'lodash';
import * as chai from 'chai';
import * as Joi from '@hapi/joi';
import * as LJoi from 'joi';
import { Joi as extendedJoi } from '../../src';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema, JoiAny } from '../../src/joi/types';
import { formatJoi, resolveJSONSchema } from '../../src/joi';
import { JoiStatement, generateJoiStatement } from '../../src/joi/generate';
import { Logger } from '../../src/common/logger';
import { ResolveOptions, FormatOptions } from '../../src/joi/options';
export { Logger, createLogger } from '../../src/common/logger';
import * as prettier from 'prettier';

export const expect = chai.expect;

export interface JoiUnitTest {
  target: any;
  valid: boolean;
}

export interface TestItem {
  title: string;
  schema: JSONSchema4;
  targetJoiSchema: JoiSchema;
  targetJoiString: string;
  only?: boolean;
  skipLegacy?: boolean;
  joiUnitTests?: JoiUnitTest[];
}

const prettierOptions: prettier.Options = {
  tabWidth: 2,
  useTabs: false,
  singleQuote: true,
  trailingComma: 'all',
  semi: true,
  parser: 'typescript',
};

export function runTest(
  testItems: TestItem[],
  resolveFunc: (schema: JSONSchema4, options?: ResolveOptions) => JoiSchema,
  genJoiFunc: (schema: JoiAny) => JoiStatement[],
  logger: Logger,
  options?: ResolveOptions): void {
  testItems.forEach((item) => {
    let itFunc = item.only ? it.only : it;
    if (item.skipLegacy && options && options.useDeprecatedJoi) {
      itFunc = it.skip;
    }
    itFunc(item.title + ((options && options.useDeprecatedJoi) ? ' - legacy' : ''), () => {
      const schema = _.assign({}, item.schema);
      const resultJoiSchema = resolveFunc(schema, options);
      const resultJoiSchemaGlobal = resolveJSONSchema(schema, options);
      const joiStatements = genJoiFunc(resultJoiSchema);
      const joiStatementsGlobal = generateJoiStatement(resultJoiSchemaGlobal);
      let targetJoiString = prettier.format(item.targetJoiString, prettierOptions);
      let joiName = 'Joi';

      if (options && options.useDeprecatedJoi) {
        joiName = 'LJoi';
        targetJoiString = targetJoiString.replace(/(?<![A-Za-z])Joi/g, joiName);
      }

      targetJoiString = prettier.format(targetJoiString, {
        tabWidth: 2,
        useTabs: false,
        singleQuote: true,
        trailingComma: 'all',
        parser: 'typescript',
      });

      const formatOption: FormatOptions = {
        joiName,
        extendedJoiName: 'extendedJoi',
        withTypeDeclaration: true,
        prettierOptions,
      };
      const resultJoiString = formatJoi(joiStatements, formatOption);
      const resultJoiStringGlobal = formatJoi(joiStatementsGlobal, formatOption);
      logger.debug({
        targetJoiSchema: item.targetJoiSchema,
        resultJoiSchema,
        resultJoiSchemaGlobal,
        targetJoiString,
        resultJoiString,
        resultJoiStringGlobal,
        joiStatements,
      });

      expect(_.isEqual(item.targetJoiSchema, resultJoiSchema), 'Joi schema equal').to.be.equal(true);
      expect(_.isEqual(targetJoiString, resultJoiString), 'Joi string equal').to.be.equal(true);
      expect(_.isEqual(resultJoiSchemaGlobal, resultJoiSchema),
        'Global Joi schema equal').to.be.equal(true);
      expect(_.isEqual(resultJoiStringGlobal, resultJoiString), 'Global Joi string equal').to.be.equal(true);
      if (item.joiUnitTests) {
        // tslint:disable-next-line: no-eval
        const joiSchema: Joi.AnySchema = <Joi.AnySchema>eval(resultJoiString.replace('extendedJoi', 'src_1.Joi'));
        item.joiUnitTests.forEach((ut) => {
          const joiRet = joiSchema.validate(ut.target, { convert: false });
          logger.debug({
            joiVersion: Joi.version, // Just a trick to make sure `Joi` is in the compiled js file
            joiRet,
            legacyJoiVersion: LJoi.version,
            extendedJoiVersion: extendedJoi.version,
          });
          if (ut.valid) {
            expect(!!joiRet.error).to.be.false;
          } else {
            expect(joiRet.error).to.be.not.undefined;
          }
        });
      }
      // tslint:disable-next-line: no-eval
    });
  });
}
