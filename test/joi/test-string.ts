// tslint:disable-next-line:no-implicit-dependencies
import {
  resolveJoiStringSchema, generateStringJoi, dateTimeRegex,
  dateRegex, timeRegex, octetRegex
} from '../../src/joi/string';
import { createLogger, TestItem, runTest } from './common';

const logger = createLogger('test-string');

const testItems: TestItem[] = [{
  title: 'string',
  schema: {
    type: 'string',
  },
  targetJoiSchema: {
    type: 'string',
    min: 0,
    allow: [''],
  },
  targetJoiString: 'Joi.string()\n  .min(0)\n  .allow(...[\'\'])',
  joiUnitTests: [{
    target: 'This is a string', valid: true,
  }, {
    target: 'Déjà vu', valid: true,
  }, {
    target: '', valid: true,
  }, {
    target: '42', valid: true,
  }, {
    target: 42, valid: false,
  }],
}, {
  title: 'length',
  schema: {
    minLength: 2,
    maxLength: 3
  },
  targetJoiSchema: {
    type: 'string',
    min: 2,
    max: 3,
  },
  targetJoiString: 'Joi.string()\n  .min(2)\n  .max(3)',
  joiUnitTests: [{
    target: 'A', valid: false,
  }, {
    target: 'AB', valid: true,
  }, {
    target: 'ABC', valid: true,
  }, {
    target: 'ABCD', valid: false,
  }],
}, {
  title: 'length - max == min',
  schema: {
    minLength: 3,
    maxLength: 3,
  },
  targetJoiSchema: {
    type: 'string',
    length: 3,
  },
  targetJoiString: 'Joi.string().length(3)',
  joiUnitTests: [{
    target: 'A', valid: false,
  }, {
    target: 'AB', valid: false,
  }, {
    target: 'ABC', valid: true,
  }, {
    target: 'ABCD', valid: false,
  }],
}, {
  title: 'regexp',
  schema: {
    pattern: '^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$',
  },
  targetJoiSchema: {
    type: 'string',
    regex: /^(\([0-9]{3}\))?[0-9]{3}-[0-9]{4}$/,
  },
  targetJoiString: 'Joi.string().regex(/^(\\([0-9]{3}\\))?[0-9]{3}-[0-9]{4}$/)',
  joiUnitTests: [{
    target: '555-1212', valid: true,
  }, {
    target: '(888)555-1212', valid: true,
  }, {
    target: '(888)555-1212 ext. 532', valid: false,
  }, {
    target: '(800)FLOWERS', valid: false,
  }],
}, {
  title: 'format - date-time',
  schema: {
    format: 'date-time',
  },
  targetJoiSchema: {
    type: 'string',
    regex: new RegExp('^' + dateTimeRegex + '$', 'i'),
  },
  targetJoiString: `Joi.string().regex(\n  /^${dateTimeRegex}$/i,\n)`,
  joiUnitTests: [{
    target: '2018-11-13T20:20:39+00:00', valid: true,
  }, {
    target: '2018-11-13T20:20:39.211+00:00', valid: true,
  }, {
    target: '2018-11-13T20:20:39', valid: false,
  }],
}, {
  title: 'format - date',
  schema: {
    format: 'date',
  },
  targetJoiSchema: {
    type: 'string',
    regex: new RegExp('^' + dateRegex + '$', 'i'),
  },
  targetJoiString: `Joi.string().regex(/^${dateRegex}$/i)`,
  joiUnitTests: [{
    target: '2018-11-13', valid: true,
  }, {
    target: '2018-11-13.', valid: false,
  }],
}, {
  title: 'format - time',
  schema: {
    format: 'time',
  },
  targetJoiSchema: {
    type: 'string',
    regex: new RegExp('^' + timeRegex + '$', 'i'),
  },
  targetJoiString: `Joi.string().regex(\n  /^${timeRegex}$/i,\n)`,
  joiUnitTests: [{
    target: '20:20:39+00:00', valid: true,
  }, {
    target: '20:20:39.121-10:00', valid: true,
  }, {
    target: '20:20:61-13:00', valid: false,
  }],
}, {
  title: 'ipv4',
  schema: {
    format: 'ipv4',
  },
  targetJoiSchema: {
    type: 'string',
    ip: 'ipv4',
  },
  targetJoiString: 'Joi.string().ip({ version: \'ipv4\' })',
  joiUnitTests: [{
    target: '1.1.1.1', valid: true,
  }, {
    target: '192.168.100.0/24', valid: true,
  }, {
    target: '255', valid: false,
  }],
}, {
  title: 'ipv6',
  schema: {
    format: 'ipv6',
  },
  targetJoiSchema: {
    type: 'string',
    ip: 'ipv6',
  },
  targetJoiString: 'Joi.string().ip({ version: \'ipv6\' })',
  joiUnitTests: [{
    target: 'FE80::0/16', valid: true,
  }, {
    target: '2002:db9::6ef:11', valid: true,
  }, {
    target: '20:20:61-13:00', valid: false,
  }],
}, {
  title: 'email',
  schema: {
    format: 'email',
  },
  targetJoiSchema: {
    type: 'string',
    email: true,
  },
  targetJoiString: 'Joi.string().email()',
  joiUnitTests: [{
    target: 'globefish@yahoo.com', valid: true,
  }, {
    target: 'a a@xx.xx', valid: false,
  }, {
    target: 'abcd', valid: false,
  }],
}, {
  title: 'hostname',
  schema: {
    format: 'hostname',
  },
  targetJoiSchema: {
    type: 'string',
    hostname: true,
  },
  targetJoiString: 'Joi.string().hostname()',
  joiUnitTests: [{
    target: 'www.yahoo.com', valid: true,
  }, {
    target: 'a a a a a', valid: false,
  }, {
    target: 'xxxx', valid: true,
  }],
}, {
  title: 'uri',
  schema: {
    format: 'uri',
  },
  targetJoiSchema: {
    type: 'string',
    uri: true,
  },
  targetJoiString: 'Joi.string().uri()',
  joiUnitTests: [{
    target: 'https://www.yahoo.com/index.html', valid: true,
  }, {
    target: 'aaa.xxx.com', valid: false,
  }, {
    target: 'ftp://1.1.1.1/pub/', valid: true,
  }],
}, {
  title: 'byte',
  schema: {
    format: 'byte',
  },
  targetJoiSchema: {
    type: 'string',
    base64: true,
  },
  targetJoiString: 'Joi.string().base64()',
  joiUnitTests: [{
    target: 'VE9PTUFOWVNFQ1JFVFM=', valid: true,
  }, {
    target: 'VE9PTUFOWVNFQ1JFVFM', valid: false,
  }, {
    target: 'd12safadf___ds', valid: false,
  }]
}, {
  title: 'uuid',
  schema: {
    format: 'uuid',
  },
  targetJoiSchema: {
    type: 'string',
    uuid: true,
  },
  targetJoiString: 'Joi.string().uuid()',
  joiUnitTests: [{
    target: 'ee0b6d7c-582f-47d4-be73-25dc41260c97', valid: true,
  }, {
    target: 'e18a429c-f222-11e9-81b4-2a2ae2dbcce4', valid: true,
  }, {
    target: 'd12safadf___ds', valid: false,
  }]
}, {
  title: 'guid',
  schema: {
    format: 'guid',
  },
  targetJoiSchema: {
    type: 'string',
    uuid: true,
  },
  targetJoiString: 'Joi.string().uuid()',
  joiUnitTests: [{
    target: 'ee0b6d7c-582f-47d4-be73-25dc41260c97', valid: true,
  }, {
    target: 'e18a429c-f222-11e9-81b4-2a2ae2dbcce4', valid: true,
  }, {
    target: 'd12safadf___ds', valid: false,
  }]
}, {
  title: 'binary min == 0 && max',
  schema: {
    format: 'binary',
    minLength: 0,
    maxLength: 300,
  },
  targetJoiSchema: {
    type: 'string',
    regex: new RegExp('^' + octetRegex + '$', 'i'),
    min: 0,
    max: 300,
    allow: [''],
  },
  targetJoiString: `Joi.string()\n  .min(0)\n  .max(300)\n  .regex(/^${octetRegex}$/i)\n  .allow(...[''])`,
  joiUnitTests: [{
    target: '0xABCD', valid: true,
  }, {
    target: '0X123adafDD', valid: true,
  }, {
    target: 'abcd', valid: true,
  }, {
    target: '', valid: true,
  }, {
    target: 'abcdx', valid: false,
  }, {
    target: '0x', valid: false,
  }]
},
];

describe('joi string', () => {
  runTest(testItems, resolveJoiStringSchema, generateStringJoi, logger);
});
