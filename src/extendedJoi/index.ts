import * as Joi from 'joi';
import { allOfExtension, AllOfSchema } from './allOf';
import { oneOfExtension, OneOfSchema } from './oneOf';

interface ExtendedJoi extends Joi.Root {
  allOf(): AllOfSchema;
  oneOf(): OneOfSchema;
}

const extendedJoi: ExtendedJoi = Joi.extend([allOfExtension, oneOfExtension]) as ExtendedJoi;

export = extendedJoi;
