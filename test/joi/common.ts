import * as _ from 'lodash';
import * as chai from 'chai';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { JoiSchema, JoiAny } from '../../src/joi/types';
import { formatJoi } from '../../src/joi';
import { JoiStatement } from '../../src/joi/generate';
import { Logger } from '../../src/common/logger';
import { Options } from '../../src/joi/options';
export { Logger, createLogger } from '../../src/common/logger';

export const expect = chai.expect;

export interface TestItem {
  title: string;
  schema: JSONSchema4;
  targetJoiSchema: JoiSchema;
  targetJoiString: string;
  only?: boolean;
}

export function runTest(
  testItems: TestItem[],
  templateSchema: JSONSchema4,
  resolveFunc: (schma: JSONSchema4, options?: Options) => JoiSchema,
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
    });
  });
}
