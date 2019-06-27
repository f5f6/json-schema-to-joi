# Change log

## 0.6.0 (2019-06-27)

* Added:
  * Add support for 'allOf'.

## 0.5.4 (2019-04-03)

* Added:
  * Add argument `banner`.

## 0.5.3 (2019-02-11)

* Fixed:
  * Update banner.

## 0.5.2 (2019-02-11)

* Fixed:
  * Output at once.

## 0.5.1 (2019-02-11)

* Fixed:
  * Missing semicolon when importing `Joi`.

## 0.5.0 (2019-02-02)

* Changed:
  * Support `batch` to process JSON schema's defintions.
  * Support user-defined title.
  
## 0.4.1 (2019-02-02)

* Fixed
  * `generateJoi`: put the `description` at the tail of each Joi statement

## 0.4.0 (2019-01-30)

* Added
  * cli

## 0.3.0 (2019-01-29)

* Added
  * joi: almost all expect
    * oneOf, allOf
    * `object`: Dependencies, Pattern Properties

## 0.2.0 (2019-01-24)

* Added
  * joi: ut
    * `test-number`
    * `test-string`

* Changed
  * joi: rename
    * `resolve` to `resolveJSONSchema`
    * `generate` to `generateJoi`
    * `format` to `formatJoi`
  
* Fixed
  * joi: follow the JSONSchema Draft 4
    * `string`
    * `number` 

## 0.1.0 (2019-01-23)

* Added
  * joi: `generate` generate Joi statement array from `JoiSchema`
  * joi: `format` format Joi statement array to printable Joi code

## 0.0.1 (2019-01-23)

* Added
  * joi: `resolve` generate `JoiSchema` from JSON schema file (version 4)

