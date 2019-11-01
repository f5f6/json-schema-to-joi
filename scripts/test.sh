#!/bin/bash

skip_lint=""
watch=""
file=""

function parse_args() {
  # named args
  while [ "$1" != "" ]; do
    case "$1" in
      -s | --skip-lint )      skip_lint="--skip-lint";          ;;
      -w | --watch )          watch="--watch";                  ;;
      * )                     file=$1
    esac
    shift
  done
}

parse_args "$@"

yarn compile $skip_lint

if [[ $watch == '--watch' ]] ; then
  tsc-watch --onSuccess "yarn test $skip_lint $file"
else
  mocha \
    --exit --trace-warnings \
    -r source-map-support/register \
    -c "build/test/**/@(test-*$file*|$file).js"
fi