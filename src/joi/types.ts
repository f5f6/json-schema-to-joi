export type JoiType = 'any' | 'array' | 'boolean' | 'binary'
  | 'date' | 'func' | 'number' | 'object' | 'string' | 'symbol' | 'alternatives' | 'allOf' | 'oneOf' | 'reference';

export type JoiSchema =
  JoiAny | JoiArray | JoiDate | JoiNumber |
  JoiObject | JoiString | JoiAlternatives | JoiReference;

export interface JoiAny {
  type: JoiType;
  description?: string;
  label?: string;
  allow?: any[];
  valid?: any[];
  invalid?: any[];
  required?: boolean;
  optional?: boolean;
  forbidden?: boolean;
  strip?: boolean;
  default?: any;
  [k: string]: any;
}

export interface JoiArray extends JoiAny {
  items?: JoiSchema[];
  ordered?: JoiSchema[];
  min?: number;
  max?: number;
  length?: number;
  unique?: boolean;
}

export interface JoiBoolean extends JoiAny {
  truthy?: any[];
  falsy?: any[];
  insensitive?: boolean;
}

export interface JoiDate extends JoiAny {
  min?: string;
  max?: string;
  greater?: string;
  less?: string;
  iso?: boolean;
  timestamp?: 'javascript' | 'unix';
}

export interface JoiNumber extends JoiAny {
  unsafe?: boolean;
  min?: number;
  max?: number;
  greater?: number;
  less?: number;
  integer?: boolean;
  precision?: number;
  multiple?: number;
  positive?: boolean;
  negative?: boolean;
  port?: boolean;
}

export interface JoiObject extends JoiAny {
  keys?: {
    [k: string]: JoiSchema;
  };
  append?: JoiSchema[];
  min?: number;
  max?: number;
  length?: number;
  patterns?: Array<{
    targetPattern: JoiSchema | string;
    schema: JoiSchema;
  }>;
  and?: string[];
  nand?: string[];
  or?: string[];
  xor?: string[];
  oxor?: string[];
  with?: {
    [key: string]: string[];
  };
  without?: string[];
  unknown?: boolean;
}

export interface JoiAlternatives extends JoiAny {
  alternatives?: JoiSchema[];
  anyOf?: JoiSchema[];
  not?: JoiSchema;
  oneOf?: JoiSchema[];
  allOf?: JoiSchema[];
}

export interface JoiString extends JoiAny {
  insensitive?: boolean;
  min?: number;
  max?: number;
  length?: number;
  regex?: RegExp;
  alphanum?: boolean;
  token?: boolean;
  email?: boolean;
  ip?: string;
  uri?: boolean;
  uuid?: boolean;
  hex?: boolean;
  base64?: boolean;
  dataUri?: boolean;
  hostname?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
  trim?: boolean;
  isoDate?: boolean;
}

export interface JoiAllOf extends JoiAny {
  items?: JoiSchema[];
}

export interface JoiOneOf extends JoiAny {
  items?: JoiSchema[];
}

export interface JoiReference extends JoiAny {
  $ref: string;
}

export function createJoiItem(type: JoiType): JoiSchema {
  return {
    type,
  };
}
