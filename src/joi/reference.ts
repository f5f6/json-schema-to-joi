// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { Options } from './options';
import { createLogger } from '../common/logger';

const logger = createLogger('reference');

// ref is like [uri]#/definitions/xxxx
export function resolveReference(ref: string, options: Options): JSONSchema4 | undefined {
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

  logger.debug({
    id, path, fragment,
  });

  // tslint:disable-next-line: no-ignored-return
  path.split('/').find((p) => {
    if (p === '') {
      return false;
    }
    logger.debug({
      p,
      fragment,
    });
    // tslint:disable-next-line: no-unsafe-any
    fragment = fragment[p];
    return fragment === undefined;
  });

  return fragment;
}
