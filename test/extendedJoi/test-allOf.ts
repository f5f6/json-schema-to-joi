import { expect } from 'chai';
import { Joi } from '../../src';

const subSchemas: Joi.SchemaLike[] = [
  Joi.number().multiple(3),
  Joi.number().multiple(5),
];

const emptySchemas: Joi.SchemaLike[] = [];

const allOfSchema = Joi.extendedJoi.allOf().items(subSchemas);
const emptySchema = Joi.extendedJoi.allOf().items(emptySchemas);

describe('allOf Joi extension', () => {
  it('passed', () => {
    const ret = allOfSchema.validate(15);
    expect(ret.value).to.be.equal(15);
    expect(ret.error).to.be.null;
  });

  it('passed, empty schemas', () => {
    const ret = emptySchema.validate(15);
    expect(ret.value).to.be.equal(15);
    expect(ret.error).to.be.null;
  });

  it('failed, matched only 1', () => {
    const ret = allOfSchema.validate(3);
    expect(ret.value).to.be.equal(3);
    const error = ret.error.details[0];
    expect(error.type).to.be.equal('allOf.items');
    expect(error.message).to.be.include('doesn\'t match at least 1 schema');
  });

  it('failed, matched none', () => {
    const ret = allOfSchema.validate(1);
    const error = ret.error.details[0];
    expect(error.type).to.be.equal('allOf.items');
    expect(error.message).to.be.include('doesn\'t match at least 1 schema');
  });
});
