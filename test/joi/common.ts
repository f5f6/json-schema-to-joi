import * as _ from 'lodash';
import * as chai from 'chai';
import * as Joi from '@hapi/joi';
import * as LegacyJoi from 'joi';
import * as extendedJoi from '../../src/extendedJoi';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema, JoiAny } from '../../src/joi/types';
import { formatJoi, resolveJSONSchema } from '../../src/joi';
import { JoiStatement, generateJoi } from '../../src/joi/generate';
import { Logger } from '../../src/common/logger';
import { Options } from '../../src/joi/options';
export { Logger, createLogger } from '../../src/common/logger';

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

export function runTest(
  testItems: TestItem[],
  resolveFunc: (schema: JSONSchema4, options?: Options) => JoiSchema,
  genJoiFunc: (schema: JoiAny) => JoiStatement[],
  logger: Logger,
  options?: Options): void {
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
      const joiStatementsGlobal = generateJoi(resultJoiSchemaGlobal);
      let targetJoiString = item.targetJoiString;
      let importedJoiName = 'Joi';

      if (options && options.useDeprecatedJoi) {
        const realJoi = options.useExtendedJoi ? 'extendedJoi.' : 'LegacyJoi.';
        importedJoiName = realJoi.substr(0, realJoi.length - 1);
        targetJoiString = targetJoiString.replace(/(?<![A-Za-z])Joi./g, realJoi);
      }

      const formatOption = {
        importedJoiName,
        importedExtendedJoiName: 'extendedJoi',
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
      expect(_.isEqual(resultJoiSchemaGlobal, resultJoiSchema), 'Global Joi schema equal').to.be.equal(true);
      expect(_.isEqual(resultJoiStringGlobal, resultJoiString), 'Global Joi string equal').to.be.equal(true);
      if (item.joiUnitTests) {
        // tslint:disable-next-line: no-eval
        const joiSchema: Joi.AnySchema = <Joi.AnySchema>eval(resultJoiString.replace(/\\/g, '\\\\'));
        item.joiUnitTests.forEach((ut) => {
          const joiRet = joiSchema.validate(ut.target, { convert: false });
          logger.debug({
            joiVersion: Joi.version, // Just a trick to make sure `Joi` is in the compiled js file
            joiRet,
            legacyJoiVersion: LegacyJoi.version,
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
