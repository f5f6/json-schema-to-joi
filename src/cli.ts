#!/usr/bin/env node

// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import * as minimist from 'minimist';
// tslint:disable-next-line: no-submodule-imports
import { readFile, writeFile } from 'mz/fs';
import { resolve, join } from 'path';
// tslint:disable-next-line: no-require-imports
const stdin = require('stdin');
import { generateJoi, resolveJSONSchema, formatJoi } from './joi';
import { whiteBright } from 'cli-color';
import * as _ from 'lodash';
import { traverseDir } from './utils';

const banner = '';

const importJoi = 'import * as Joi from \'joi\';\n\n';

// tslint:disable-next-line: no-floating-promises
main(minimist(process.argv.slice(2), {
  string: [ 'banner', 'cwd', 'extendedJoi' ],
  alias: {
    help: ['h'],
    input: ['i'],
    output: ['o'],
    banner: ['b'],
    cwd: ['c'],
    extendedJoi: ['e'],
  }
}));

async function main(argv: minimist.ParsedArgs): Promise<void> {
  if (argv.help) {
    printHelp();
    process.exit(0);
  }

  // tslint:disable: no-unsafe-any
  const argIn: string = argv._[0] || argv.input;
  const argOut: string = argv._[1] || argv.output;
  const argBanner: string = argv.banner || banner;
  const batch: string = argv.batch || 'definitions';
  const title: string | undefined = batch ? undefined : argv.title;
  const cwd: string | undefined = argv.cwd;
  const extendedJoi: string = argv.extendedJoi || importJoi;
  let all = argBanner + extendedJoi;

  try {
    const schema: JSONSchema4 = JSON.parse(await readInput(argIn));
    const subSchemas: any = {};

    if (cwd) {
      await traverseDir(cwd, async (fileName: string, dir: string): Promise<void> => {
        if (fileName.endsWith('.json')) {
          const fullFileName = join(dir, fileName);
          let fileId = fullFileName.substr(cwd.length);
          if (fileId.startsWith('/')) {
            fileId = fileId.substr(1);
          }
          subSchemas[fileId] = JSON.parse(await readInput(fullFileName));
          return;
        }
      });
    }

    if (batch) {
      const definitions = _.get(schema, batch);
      if (!definitions) {
        throw new Error('batch but no definitions in the root of the JSON schema');
      }

      const keys = _.keys(definitions);

      for (const key of keys) {
        const itemSchema: JSONSchema4 = definitions[key];
        if (!itemSchema.title) {
          itemSchema.title = key;
        }
        const joiSchema = resolveJSONSchema(itemSchema, { rootSchema: schema, subSchemas, });
        const joiStatements = generateJoi(joiSchema, true);
        const joiString = formatJoi(joiStatements);
        all += 'export ' + joiString + '\n\n';
      }
    } else {
      if (!schema.title && title) {
        schema.title = title;
      }
      const joiSchema = resolveJSONSchema(schema, { rootSchema: schema, subSchemas });
      const joiStatements = generateJoi(joiSchema, true);
      const joiString = formatJoi(joiStatements);
      all += 'export ' + joiString + '\n\n';
    }
    await writeOutput(all, argOut);
  } catch (e) {
    // tslint:disable-next-line: no-console
    console.error(whiteBright.bgRedBright('error'), e);
    process.exit(1);
  }
}

function writeOutput(ts: string, argOut: string): Promise<void> {
  if (!argOut) {
    try {
      process.stdout.write(ts);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return writeFile(argOut, ts);
}

function readInput(argIn?: string): any {
  if (!argIn) {
    return new Promise(stdin);
  }
  return readFile(resolve(process.cwd(), argIn), 'utf-8');
}

function printHelp(): void {
  // tslint:disable: no-require-imports
  // tslint:disable-next-line: no-implicit-dependencies
  const pkg = require('../package.json');

  process.stdout.write(
    `
${pkg.name} ${pkg.version}
Usage: json2joi [--banner, -b] [BANNER] [--batch] [SECTION]
        [--title] [TITLE] [--cwd] [CWD] [--extendedJoi] [EXTENDEDJOI]
        [--input, -i] [IN_FILE] [--output, -o] [OUT_FILE]

optional parameters:

  -h, --help                  show this help message and exit
  --title TITLE               use TITLE as the title of the JSON schema if there is no title
                              meaningless when batch is set
  --cwd CWD                   use CWD as the JSON sub schema directory
  --extendedJoi EXTENDEDJOI   use EXTENDEDJOI as the Joi import expression, "import { Joi } from 'your-extened-joi';"
                              default: "import * as Joi from 'joi';"
  --batch SECTION             use the SECTION of the input and generate a batch of Joi schema objects
                              default: "definitions"
  -b, --banner BANNER         add BANNER in the beginning
  -i, --input IN_FILE         the input source of JSON schema
                              if IN_FILE is absent or -, read standard input.
  -o, --output OUT_FILE       the output source file of Joi schema
                              if OUT_FILE is absent, write to standard output.
`
  );
}
