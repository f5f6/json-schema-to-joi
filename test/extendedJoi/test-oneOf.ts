import { expect } from 'chai';
import { Joi as extendedJoi } from '../../src';
import * as Joi from 'joi';

const subSchemas: Joi.SchemaLike[] = [
  Joi.number().multiple(3),
  Joi.number().multiple(5),
];

const emptySchemas: Joi.SchemaLike[] = [];

const oneOfSchema = extendedJoi.oneOf().items(subSchemas);

const emptySchema = extendedJoi.oneOf().items(emptySchemas);

describe('oneOf Joi extension', () => {
  it('passed', () => {
    const ret = oneOfSchema.validate(3);
    expect(ret.value).to.be.equal(3);
    expect(ret.error).to.be.null;
  });

  it('failed, empty schemas', () => {
    const ret = emptySchema.validate(15);
    expect(ret.value).to.be.equal(15);
    const error = ret.error.details[0];
    expect(error.type).to.be.equal('oneOf.items');
    expect(error.message).to.be.include('matches zero or multiple schemas');
  });

  it('failed, matched none', () => {
    const ret = oneOfSchema.validate(1);
    const error = ret.error.details[0];
    expect(error.type).to.be.equal('oneOf.items');
    expect(error.message).to.be.include('matches zero or multiple schemas');
  });
});
