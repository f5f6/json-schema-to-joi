# json-schema-to-joi

A utility to convert JSON schema (draft 4) to Joi validation schema.

## Usage

```bash
    json-schema-to-joi 0.6.0
    Usage: json2joi [--batch] [--title] [TITLE] [--input, -i] [IN_FILE] [--output, -o] [OUT_FILE]

    Option batch indicates that the programe will use the defiition section of the input. (Default: false)
    Option title indicates that the programe will use it as the title of the interface
    if there are no title in the JSON schema. (Meaningless when batch is true)
    With no IN_FILE, or when IN_FILE is -, read standard input.
    With no OUT_FILE and when IN_FILE is specified, create .d.ts file in the same directory.
    With no OUT_FILE nor IN_FILE, write to standard output.
```

## Current limitations

Don't support below JSON schema features

* oneOf
* `object`: 
  * Dependencies
  * Pattern Properties
