// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';

export interface SubSchemas {
  [k: string]: JSONSchema4;
}

export interface Options {
  subSchemas?: SubSchemas;
  rootSchema?: JSONSchema4;
}
