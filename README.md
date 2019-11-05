# json-schema-to-joi

A utility to convert JSON schema (draft 4) to Joi validation schema.

## Usage

### Client

```bash
json-schema-to-joi 2.0.0
  Usage: json2joi [--banner, -b] [BANNER] [--batch] [SECTION]
          [--title] [TITLE] [--cwd] [CWD] [--joiLib] [JOILIBNAME]
          [--input, -i] [IN_FILE] [--output, -o] [OUT_FILE]

  optional parameters:
    -h, --help                  Show this help message and exit.
    --title TITLE               The title used as the Joi schema variable name
                                if the JSON schema doesn't have a title itself.
                                TITLE is meaningless when "--batch" option is present.
    --cwd CWD                   CWD is used as the root directory of JSON sub schemas.
    --importStatement IMPORT    IMPORT is the statement to import joi library.
                                  Default: "import * as Joi from '@hapi/joi'"
    --useExtendedJoi            If the option is true, the prog will use extended legacy joi library
                                to support "oneOf" and "allOf" schemas.
                                  Default: false.
    --batch SECTION             Use the SECTION of the INPUT to generate a batch of JSON schemas.
                                  Example:
                                    "definitions" for standard JSON schema files.
                                    "components.schemas" for OpenAPI 3.x files.
    -b, --banner BANNER         Add BANNER in the beginning of the output.
    -i, --input  INPUT          The input JSON schema file.
    -o, --output OUTPUT         The output source file including generated Joi schema(s).
                                If OUTPUT is absent, the prog will write to the standard output
```

### Library

[API Docs generated by typedoc](https://f5f6.github.io/json-schema-to-joi/).
