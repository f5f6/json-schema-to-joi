import { JoiNumber, createJoiItem } from "./types";
import { JSONSchema4 } from "json-schema";
import { generateAnyJoi, getTailChar } from "./generate";

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

export function generateNumberJoi(schema: JoiNumber, level: number = 0): string {
  let head = 'Joi.number()';
  let content = '';
  let tail = '';
  if (schema.min !== undefined) {
    content += `.min(${schema.min})`;
  }
  if (schema.max !== undefined) {
    content += `.max(${schema.max})`;
  }

  if (schema.integer !== undefined) {
    content += `.integer()`;
  }

  content += generateAnyJoi(schema, level + 1);

  tail += getTailChar(level);
  return head + content + tail;
}