// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';

export interface SubSchemas {
  [k: string]: JSONSchema4;
}

export interface ResolveOptions {
  subSchemas?: SubSchemas;
  rootSchema?: JSONSchema4;
  useDeprecatedJoi?: boolean;   // true: former 'joi' lib, false: '@hapi/joi' lib
  useExtendedJoi?: boolean;     // use extended Joi (only when it is required to
  // support allOf and oneOf using deprecatedJoi)
}

export interface FormatOptions {
  joiName?: string;
  extendedJoiName?: string;
}
