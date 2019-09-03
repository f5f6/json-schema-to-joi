# json-schema-to-joi

A utility to convert JSON schema (draft 4) to Joi validation schema.

## Usage

```bash
json-schema-to-joi 1.1.0
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
```

## Limitations

Don't support below JSON schema features

* `object`:
  * Dependencies
  * Pattern Properties
