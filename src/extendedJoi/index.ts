import * as Joi from 'joi';
import { allOfExtension, AllOfSchema } from './allOf';
import { oneOfExtension, OneOfSchema } from './oneOf';

export interface ExtendedJoi extends Joi.Root {
  allOf(): AllOfSchema;
  oneOf(): OneOfSchema;
}

export const extendedJoi: ExtendedJoi = Joi.extend([allOfExtension, oneOfExtension]) as ExtendedJoi;

export * from 'joi';
