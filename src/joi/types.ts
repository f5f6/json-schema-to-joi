export type JoiType = 'any' | 'array' | 'boolean' | 'binary'
  | 'date' | 'func' | 'number' | 'object' | 'string' | 'symbol' | 'alternatives' | 'allOf' | 'oneOf';

export type JoiSchema =
  JoiAny | JoiArray | JoiDate | JoiNumber |
  JoiObject | JoiString | JoiAlternatives | JoiBinary;

export interface JoiBase {
  type: JoiType;
  description?: string;
  label?: string;
}
export interface JoiAny extends JoiBase {
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
  pattern?: {
    pattern: JoiSchema | string;
    schema: JoiSchema;
  }[]; // modified to array type
  and?: string[];
  nand?: string[];
  or?: string[];
  xor?: string[];
  oxor?: string[];
  //with?: string[];
  with?: { 
    [k: string]: string[] | JoiSchema;
  };
  without?: string[];
  unknown?: boolean;
}

export interface JoiAlternatives extends JoiAny {
  alternatives?: JoiSchema[];
  anyOf?: JoiSchema[];
  not?: JoiSchema;
}

export interface JoiBinary extends JoiAny {
  min?: number;
  max?: number;
}

export interface JoiString extends JoiAny {
  insensitive?: boolean;
  min?: number;
  max?: number;
  length?: number;
  regex?: string[];
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

export interface JoiAllOf extends JoiBase {
  items?: JoiSchema[];
}

export interface JoiOneOf extends JoiBase {
  items?: JoiSchema[];
}

export function createJoiItem(type: JoiType): JoiSchema {
  return {
    type,
  };
}
