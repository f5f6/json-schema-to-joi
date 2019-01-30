#!/usr/bin/env node

// tslint:disable-next-line: no-implicit-dependencies
import { JSONSchema4 } from 'json-schema';
import * as minimist from 'minimist';
// tslint:disable-next-line: no-submodule-imports
import { readFile, writeFile } from 'mz/fs';
import { resolve } from 'path';
// tslint:disable-next-line: no-require-imports
const stdin = require('stdin');
import { generateJoi, resolveJSONSchema, formatJoi } from './joi';
import { whiteBright } from 'cli-color';

// tslint:disable-next-line: no-floating-promises
main(minimist(process.argv.slice(2), {
  alias: {
    help: ['h'],
    input: ['i'],
    output: ['o']
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

  try {
    const schema: JSONSchema4 = JSON.parse(await readInput(argIn));
    const joiSchema = resolveJSONSchema(schema, { rootSchema: schema });
    const joiStatements = generateJoi(joiSchema, true);
    const joiString = formatJoi(joiStatements);
    await writeOutput(joiString, argOut);
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
    Usage: json2joi [--input, -i] [IN_FILE] [--output, -o] [OUT_FILE]

    With no IN_FILE, or when IN_FILE is -, read standard input.
    With no OUT_FILE and when IN_FILE is specified, create .d.ts file in the same directory.
    With no OUT_FILE nor IN_FILE, write to standard output.
    `
  );
}
