import { JSONSchema4 } from "json-schema";
import { JoiSchema, createJoiItem, JoiAlternatives } from "./types";
import { resolveType } from "./resolveType";
import { SubSchemas } from "./options";
import { join } from "path";

function resolveAnyOf(schemas: JSONSchema4[]): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.try = schemas.map((schema) => resolve(schema));
  return joiSchema;
}

function resolveOneOf(schemas: JSONSchema4[]): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.try = schemas.map((schema) => resolve(schema));
  return joiSchema;
}

function resolveNot(schema: JSONSchema4): JoiAlternatives {
  const joiSchema = createJoiItem('alternatives') as JoiAlternatives;
  joiSchema.not = resolve(schema);
  return joiSchema;
}

function resolveReference(ref: string, schema: JSONSchema4, subSchema?: SubSchemas): JSONSchema4 {
  const id = ref.substr(0, ref.indexOf('#') + 1);
  const path = ref.substr(ref.indexOf('#') + 1);

  let refSchema;

  if (id && subSchema) {
    refSchema = subSchema[id] || subSchema[id.substr(0, id.length - 1)];
  }

  if (!refSchema) {
    refSchema = schema;
  }

  let fragment = refSchema;
  path.split('/').some((p) => {
    fragment = typeof fragment === 'object' && fragment[p];
    return fragment === undefined;
  })

  return fragment;
}

export function resolve(schema: JSONSchema4, subSchema?: SubSchemas): JoiSchema {
  if (schema.type) {
    return resolveType(schema);
  }
  if (schema.anyOf) {
    return resolveAnyOf(schema.anyOf);
  }

  // TODO schema.allOf


  if (schema.oneOf) {
    return resolveOneOf(schema.oneOf);
  }

  if (schema.not) {
    return resolveNot(schema.not);
  }

  if (schema.$ref) {
    return resolve(resolveReference(schema.$ref, schema, subSchema));
  }

  if (schema.enum) {
    return {
      type: 'any',
      valid: schema.enum,
    };
  }

  return {
    type: 'any'
  };
}