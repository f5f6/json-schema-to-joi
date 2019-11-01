import * as Joi from 'joi';

interface OneOfSchema extends Joi.AnySchema {
  items(types: Joi.SchemaLike[]): this;
}

interface OneOfSchemaParams {
  items: Joi.SchemaLike[];
}

const oneOfExtension: Joi.Extension = {
  name: 'oneOf',
  language: {
    items: 'Value \"{{label}}\" matches zero or multiple schemas, indices of which are {{!index}}',
  },
  rules: [{
    name: 'items',
    params: {
      items: Joi.array().items(Joi.object()).required(),
    },
    validate(
      this: Joi.ExtensionBoundSchema, params: OneOfSchemaParams,
      value: any,
      _state: Joi.State, options: Joi.ValidationOptions
    ): any {
      const index: number[] = [];
      params.items.forEach((item, i) => {
        const ret = Joi.validate(value, item, options);
        if (ret.error) {
          return;
        }
        index.push(i);
      });

      if (index.length === 1) {
        return value;
      }

      return this.createError('oneOf.items', {
        index: JSON.stringify(index),
      }, {
          key: JSON.stringify(value),
          path: '',
        }, options);
    }
  }]
};

export {
  oneOfExtension,
  OneOfSchema,
};
