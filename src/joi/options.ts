import * as prettier from 'prettier';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { OpenAPIV3 } from 'openapi-types';

export interface ResolveOptions {
  useDeprecatedJoi?: boolean;   // true: former 'joi' lib, false: '@hapi/joi' lib
  useExtendedJoi?: boolean;     // use extended Joi (only when it is required to
  // support allOf and oneOf using deprecatedJoi)
  rootSchema?: JSONSchema4 | Partial<OpenAPIV3.Document>;
}

export interface FormatOptions {
  joiName?: string;
  extendedJoiName?: string;
  withExport?: boolean;
  prettierOptions?: prettier.Options;
  withTypeDeclaration?: boolean;
}
