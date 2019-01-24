declare module 'json-diff' {
  export interface Options {
    keysOnly: boolean,
  }

  export function diff(obj1: any, obj2: any, options: Partial<Options> = {}): any;
}
