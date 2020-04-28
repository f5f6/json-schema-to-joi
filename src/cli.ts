#!/usr/bin/env node

import * as minimist from 'minimist';
import * as minimistOptions from 'minimist-options';
import { whiteBright } from 'cli-color';
import { fs } from 'mz';
import { resolve, join } from 'path';
// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import { traverseDir } from './utils';
import { resolveJSONSchema, generateJoiStatement, formatJoi } from './joi';
// tslint:disable-next-line: no-require-imports
const stdin = require('stdin');
import * as _ from 'lodash';
import * as prettier from 'prettier';
import { resolveBundledJSONSchema } from './joi/resolve';
import { JoiStatement } from './joi/generate';

// tslint:disable: no-console

// tslint:disable-next-line: naming-convention
interface JSONSchema4Definitions {
  [k: string]: JSONSchema4;
}

const defaultImportStatement = 'import * as Joi from \'@hapi/joi\';';
const legacyImportStatement = 'import * as Joi from \'joi\';';

const argOptions = minimistOptions.default({
  input: {
    type: 'string',
    alias: 'i',
    default: '',
  },
  output: {
    type: 'string',
    alias: 'o',
    default: '',
  },
  help: {
    type: 'boolean',
    default: false,
    alias: 'h',
  },
  version: {
    type: 'boolean',
    default: false,
    alias: 'v',
  },
  cwd: {
    type: 'string',
  },
  importStatement: {
    type: 'array',
    default: [defaultImportStatement],
  },
  joiName: {
    type: 'string',
    default: 'Joi',
  },
  extendedJoiName: {
    type: 'string',
    default: '',
  },
  useDeprecatedJoi: {
    type: 'boolean',
    default: false,
  },
  title: {
    type: 'string',
    alias: 't',
  },
  batch: {
    type: 'string',
    alias: 'b'
  },
  banner: {
    type: 'string',
  }
});

async function main(): Promise<void> {
  const args = minimist(process.argv.slice(2), argOptions);

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.version) {
    printVersion();
    process.exit(0);
  }

  const banner = <string | undefined>args.banner || '';
  const batch = <string | undefined>args.batch;
  const title = !batch ? (<string | undefined>args.title || '') : '';
  const cwd = <string>args.cwd;
  const joiName = <string>args.joiName;
  const extendedJoiName = <string>args.extendedJoiName;
  const useDeprecatedJoi = <boolean>args.useDeprecatedJoi;
  let importStatement = <string[]>args.importStatement;
  const input = <string>args.input;
  const output = <string>args.output;

  if (useDeprecatedJoi && !importStatement) {
    importStatement = [legacyImportStatement];
  }

  let allOutput = banner + '\n\n' + importStatement.join('\n') + '\n\n';
  try {
    const schemas: JSONSchema4 = <JSONSchema4>JSON.parse(await readInput(input));
    const subSchemas: JSONSchema4Definitions = {};

    if (cwd) {
      await traverseDir(cwd, async (fileName: string, dir: string): Promise<void> => {
        if (fileName.endsWith('.json')) {
          const fullFileName = join(dir, fileName);
          let fileId = fullFileName.substr(cwd.length);
          if (fileId.startsWith('/')) {
            fileId = fileId.substr(1);
          }
          subSchemas[fileId] = <JSONSchema4>JSON.parse(await readInput(fullFileName));
          return;
        }
      });
    }
    if (batch) {
      const definitions = <JSONSchema4Definitions>_.get(schemas, batch);
      if (!definitions) {
        throw new Error(`batch mode: no ${batch} SECTION in the root of the JSON schema`);
      }

      const joiSchemas = resolveBundledJSONSchema(schemas);
      const joiStats: JoiStatement[] = [];
      joiSchemas.forEach((subSchema) => {
        joiStats.push(...generateJoiStatement(subSchema, true));
      });

      allOutput = formatJoi(joiStats, { withExport: true, });
    } else {
      if (!schemas.title && title) {
        schemas.title = title;
      }
      const joiSchema = resolveJSONSchema(schemas, {
        rootSchema: schemas,
        subSchemas,
        useExtendedJoi: !!extendedJoiName,
        useDeprecatedJoi,
      });
      const joiStatement = generateJoiStatement(joiSchema, true);
      const joiTypeScriptCode = formatJoi(joiStatement, {
        joiName, extendedJoiName,
      });
      allOutput += 'export ' + joiTypeScriptCode + '\n\n';
    }

    allOutput = prettier.format(allOutput, {
      tabWidth: 2,
      useTabs: false,
      singleQuote: true,
      trailingComma: 'all',
      semi: true,
      parser: 'typescript',
    });

    await writeOutput(allOutput, output);

  } catch (e) {
    console.error(whiteBright.bgRedBright('error'), e);
    process.exit(1);
  }
}

function writeOutput(ts: string, argOut?: string): Promise<void> {
  if (!argOut) {
    try {
      process.stdout.write(ts);
      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  }
  return fs.writeFile(argOut, ts);
}

function readInput(argIn?: string): Promise<string> {
  if (!argIn) {
    // tslint:disable-next-line: no-unsafe-any
    return new Promise(stdin);
  }
  return fs.readFile(resolve(process.cwd(), argIn), 'utf-8');
}

function getPkgInfo(): { name: string, version: string } {
  // tslint:disable-next-line: no-require-imports
  const pkg = require('../package.json');
  return {
    // tslint:disable-next-line: no-unsafe-any
    name: pkg.name,
    // tslint:disable-next-line: no-unsafe-any
    version: pkg.version,
  };
}

function printVersion(): void {
  const { name, version } = getPkgInfo();
  process.stdout.write(`${name} ${version}\n`);
}

function printHelp(): void {
  const { name, version } = getPkgInfo();
  const helpMsg =
    `${name} ${version}
  Usage: json2joi [--banner, -b] [BANNER] [--batch] [SECTION]
          [--title] [TITLE] [--cwd] [CWD] [--useDeprecatedJoi] [--useExtendedJoi]
          [--importStatement] [IMPORT]
          [--input, -i] [IN_FILE] [--output, -o] [OUT_FILE]

  optional parameters:
    -h, --help                  Show this help message and exit.
    -v, --version               Show the program version.
    --title TITLE               The title used as the Joi schema variable name
                                if the JSON schema doesn't have a title itself.
                                TITLE is meaningless when "--batch" option is present.
    --cwd CWD                   CWD is used as the root directory of JSON sub schemas.
    --joiName JOINAME           JOINAME is the module name of joi library.
                                  Default: "Joi".
    --extendedJoiName EJOINAME  EJOINAME is the module name of extended joi library.
                                If you don't want to use deprecated joi extension to support
                                "allOf" and "oneOf", please leave it empty.
    --importStatement IMPORT    IMPORT is the statement(s) to import joi library and extended joi library.
                                It can be multiple statements.
                                  Default: "${defaultImportStatement}"
                                  If "useDeprecatedJoi" is true ,IMPORT will be "${legacyImportStatement}".
                                  If "extendedJoiName" is set, another IMPORT statement must be added.
    --useDeprecatedJoi          If the option is true, the prog will use deprecated library 'joi'
                                instead of '@hapi/joi'
                                  Default: false.
    --batch SECTION             Use the SECTION of the INPUT to generate a batch of JSON schemas.
                                  Example:
                                    "definitions" for standard JSON schema files.
                                    "components.schemas" for OpenAPI 3.x files.
    -b, --banner BANNER         Add BANNER in the beginning of the output.
    -i, --input  INPUT          The input JSON schema file.
    -o, --output OUTPUT         The output source file including generated Joi schema(s).
                                If OUTPUT is absent, the prog will write to the standard output
`;
  process.stdout.write(helpMsg);
}

main()
  // tslint:disable-next-line: no-empty
  .then(() => {
  })
  .catch((err) => {
    console.error(whiteBright.bgRedBright('error'), err);
  });
