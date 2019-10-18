import * as _ from 'lodash';
import * as chai from 'chai';
import * as Joi from '@hapi/joi';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema, JoiAny } from '../../src/joi/types';
import { formatJoi } from '../../src/joi';
import { JoiStatement } from '../../src/joi/generate';
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
  joiUnitTests?: JoiUnitTest[];
}

export function runTest(
  testItems: TestItem[],
  templateSchema: JSONSchema4,
  resolveFunc: (schema: JSONSchema4, options?: Options) => JoiSchema,
  genJoiFunc: (schema: JoiAny) => JoiStatement[],
  logger: Logger,
  options?: Options): void {
  testItems.forEach((item) => {
    const itFunc = item.only ? it.only : it;
    itFunc(item.title, () => {
      const schema = _.assign({}, templateSchema, item.schema);
      const resultJoiSchema = resolveFunc(schema, options);
      const joiStatements = genJoiFunc(resultJoiSchema);
      const resultJoiString = formatJoi(joiStatements);
      logger.debug({
        targetJoiSchema: item.targetJoiSchema,
        resultJoiSchema,
        targetJoiString: item.targetJoiString,
        resultJoiString,
        joiStatements,
      });
      expect(_.isEqual(item.targetJoiSchema, resultJoiSchema), 'Joi schema equal').to.be.equal(true);
      expect(_.isEqual(item.targetJoiString, resultJoiString), 'Joi string equal').to.be.equal(true);
      if (item.joiUnitTests) {
        // tslint:disable-next-line: prefer-const
        let joiSchema: Joi.AnySchema;
        // tslint:disable-next-line: no-eval
        eval(`joiSchema = ${resultJoiString};`);
        item.joiUnitTests.forEach((ut) => {
          const joiRet = joiSchema.validate(ut.target, { convert: false });
          logger.debug({
            joiVersion: Joi.version, // Just a trick to make sure `Joi` is in the compiled js file
            joiRet,
          });
          if (ut.valid) {
            expect(joiRet.error).to.be.undefined;
          } else {
            expect(joiRet.error).to.be.not.undefined;
          }
        });
      }
      // tslint:disable-next-line: no-eval

    });
  });
}
