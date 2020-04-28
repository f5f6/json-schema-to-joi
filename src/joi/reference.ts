// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { ResolveOptions } from './options';
import { JoiReference } from './types';
import { JoiStatement, openJoi, JoiSpecialChar, closeJoi, generateAnyJoi } from './generate';

// ref is like [uri]#/definitions/xxxx
export function resolveReference(ref: string, options: ResolveOptions): JSONSchema4 | undefined {
  const id = ref.substr(0, ref.indexOf('#') + 1);
  const path = ref.substr(ref.indexOf('#') + 1);

  let refSchema: JSONSchema4 | undefined;

  const subSchemas = options.subSchemas;
  if (id && subSchemas) {
    refSchema = subSchemas[id] || subSchemas[id.substr(0, id.length - 1)];
  }

  if (!refSchema) {
    refSchema = options.rootSchema;
  }

  if (!refSchema) {
    return undefined;
  }

  let fragment = refSchema;

  // tslint:disable-next-line: no-ignored-return
  path.split('/').find((p) => {
    if (p === '') {
      return false;
    }
    // tslint:disable-next-line: no-unsafe-any
    fragment = fragment[p];
    return fragment === undefined;
  });

  return fragment;
}

export function generateReferenceJoi(schema: JoiReference): JoiStatement[] {
  const content = openJoi([
    JoiSpecialChar.REFERENCE,
    schema.$ref,
  ]);

  content.push(...generateAnyJoi(schema));

  return closeJoi(content);
}
