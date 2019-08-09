// tslint:disable-next-line:no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { resolveJoiOneOfSchema, generateOneOfJoi } from '../../src/joi/oneOf';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-array');

// tslint:disable-next-line:naming-convention
const allOfJSONSchemaTemplate: JSONSchema4 = {
};

const testItems: TestItem[] = [
  {
    title: 'oneOf extend an object',
    schema: {
      oneOf: [
        {
          type: 'object',
          required: [
            'deviceId',
            'service',
            'userId',
            'deviceType',
            'deviceOsType',
            'clientType'
          ],
          properties: {
            deviceId: {
              type: 'string'
            },
            service: {
              type: 'string'
            },
            realm: {
              type: 'string'
            },
            userId: {
              type: 'string'
            },
            tuid: {
              type: 'string'
            },
            msisdn: {
              type: 'string'
            },
            email: {
              type: 'string'
            },
            deviceName: {
              type: 'string'
            },
            deviceType: {
              type: 'number'
            },
            deviceOsType: {
              type: 'number'
            },
            osVersion: {
              type: 'string'
            },
            clientType: {
              type: 'string'
            },
            clientVersion: {
              type: 'string'
            },
            tenantId: {
              type: 'string'
            },
            wrgUrl: {
              type: 'string'
            },
            wrgSessionId: {
              type: 'string'
            },
            wrgClientId: {
              type: 'string'
            }
          }
        }, {
          required: [
            'lastUpdateTime'
          ]
        }, {
          properties: {
            lastUpdateTime: {
              type: 'number'
            }
          }
        }
      ]
    },
    targetJoiSchema: {
      type: 'oneOf',
      items: [{
        type: 'object',
        keys: {
          deviceId: {
            type: 'string',
            required: true,
          },
          service: {
            type: 'string',
            required: true,
          },
          realm: {
            type: 'string',
          },
          userId: {
            type: 'string',
            required: true,
          },
          tuid: {
            type: 'string',
          },
          msisdn: {
            type: 'string',
          },
          email: {
            type: 'string',
          },
          deviceName: {
            type: 'string',
          },
          deviceType: {
            type: 'number',
            required: true,
          },
          deviceOsType: {
            type: 'number',
            required: true,
          },
          osVersion: {
            type: 'string',
          },
          clientType: {
            type: 'string',
            required: true,
          },
          clientVersion: {
            type: 'string',
          },
          tenantId: {
            type: 'string',
          },
          wrgUrl: {
            type: 'string',
          },
          wrgSessionId: {
            type: 'string',
          },
          wrgClientId: {
            type: 'string',
          },
        },
        unknown: true,
      },
      {
        type: 'object',
        keys: {
          lastUpdateTime: {
            required: true,
            type: 'any',
          }
        },
        unknown: true,
      }, {
        type: 'object',
        keys: {
          lastUpdateTime: {
            type: 'number',
          }
        },
        unknown: true,
      }],
    },
    targetJoiString: '' +
      'Joi.extendedJoi.oneOf().items([\n' +
      '  Joi.object().keys({\n' +
      '    deviceId: Joi.string().required(),\n' +
      '    service: Joi.string().required(),\n' +
      '    realm: Joi.string(),\n' +
      '    userId: Joi.string().required(),\n' +
      '    tuid: Joi.string(),\n' +
      '    msisdn: Joi.string(),\n' +
      '    email: Joi.string(),\n' +
      '    deviceName: Joi.string(),\n' +
      '    deviceType: Joi.number().required(),\n' +
      '    deviceOsType: Joi.number().required(),\n' +
      '    osVersion: Joi.string(),\n' +
      '    clientType: Joi.string().required(),\n' +
      '    clientVersion: Joi.string(),\n' +
      '    tenantId: Joi.string(),\n' +
      '    wrgUrl: Joi.string(),\n' +
      '    wrgSessionId: Joi.string(),\n' +
      '    wrgClientId: Joi.string(),\n' +
      '  }).unknown(),\n' +
      '  Joi.object().keys({\n' +
      '    lastUpdateTime: Joi.any().required(),\n' +
      '  }).unknown(),\n' +
      '  Joi.object().keys({\n' +
      '    lastUpdateTime: Joi.number(),\n' +
      '  }).unknown(),\n' +
      '])',
  },
];

describe('joi oneOf', () => {
  runTest(testItems, allOfJSONSchemaTemplate, resolveJoiOneOfSchema, generateOneOfJoi, logger);
});
