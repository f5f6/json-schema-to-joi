import { JoiNumber, createJoiItem } from "./types";
import { JSONSchema4 } from "json-schema";
import { generateAnyJoi, JoiStatement, openJoi, closeJoi } from "./generate";

export function getJoiNumberSchema(schema: JSONSchema4): JoiNumber {
  const joiSchema = createJoiItem('number') as JoiNumber;
  if (schema.type === 'integer') {
    joiSchema.integer = true;
  }

  if (schema.enum) {
    joiSchema.valid = schema.enum;
  }

  joiSchema.min = schema.minimum;
  joiSchema.max = schema.maximum;
  joiSchema.greater = schema.exclusiveMinimum;
  joiSchema.less = schema.exclusiveMaximum;
  joiSchema.multiple = schema.multipleOf;

  return joiSchema;
}

export function generateNumberJoi(schema: JoiNumber, level: number = 0): JoiStatement[] {
  let content = openJoi(['Joi.number()']);
  if (schema.min !== undefined) {
    content.push(`.min(${schema.min})`);
  }
  if (schema.max !== undefined) {
    content.push(`.max(${schema.max})`);
  }

  if (schema.integer) {
    content.push(`.integer()`);
  }

  content.push(...generateAnyJoi(schema, level + 1));

  return closeJoi(content);
}