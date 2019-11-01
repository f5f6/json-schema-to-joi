import * as Joi from 'joi';

interface AllOfSchema extends Joi.AnySchema {
  items(types: Joi.SchemaLike[]): this;
}

interface AllOfSchemaParams {
  items: Joi.SchemaLike[];
}

const allOfExtension: Joi.Extension = {
  name: 'allOf',
  language: {
    items: 'Value \"{{!label}}\" doesn\'t match at least 1 schema, ' +
      'indices of which are {{!index}}, errors are {{!errorMsg}}'
  },
  rules: [{
    name: 'items',
    params: {
      items: Joi.array().items(Joi.object()).required(),
    },
    validate(
      this: Joi.ExtensionBoundSchema, params: AllOfSchemaParams,
      value: any,
      _state: Joi.State, options: Joi.ValidationOptions
    ): any {
      let error: Joi.ValidationErrorItem | undefined;
      const index: number[] = [];
      const errorMsg: string[] = [];
      params.items.forEach((item, i) => {
        const ret = Joi.validate(value, item, options);
        if (ret.error) {
          error = ret.error.details[0];
          errorMsg.push(error.message);
          index.push(i);
        }
      });
      if (index.length === 0) {
        return value;
      }

      return this.createError('allOf.items', {
        index: JSON.stringify(index),
        errorMsg: JSON.stringify(errorMsg),
      }, {
          key: JSON.stringify(value),
          path: '',
        }, options);
    }
  }]
};

export {
  allOfExtension,
  AllOfSchema,
};
