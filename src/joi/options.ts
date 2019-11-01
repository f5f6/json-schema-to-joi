// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';

export interface SubSchemas {
  [k: string]: JSONSchema4;
}

export interface Options {
  subSchemas?: SubSchemas;
  rootSchema?: JSONSchema4;
  useDeprecatedJoi?: boolean;   // true: former 'joi' lib, false: '@hapi/joi' lib
  useExtendedJoi?: boolean;     // only valid when `useDeprecatedJoi` is true,
  // use extended Joi to support allOf and oneOf
}
