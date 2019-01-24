#!/bin/bash

echo "Linting..."

format='codeFrame'
if [[ $1 == '--short' ]]; then
  format='verbose'
fi

tslint --fix --format $format --project tsconfig.json
retVal=$?
if [ $retVal -ne 0 ]; then
    echo ">>>>> There are linting errors."
fi

echo

if [[ -n $1 ]]; then
  echo "Run 'yarn lint' to show detail"
else
  echo "Run 'yarn lint --short' to show violations without code frame"
fi

echo

exit $retVal