#!/bin/bash

skip_lint="no"

function parse_args() {
  # positional args
  args=()

  # named args
  while [ "$1" != "" ]; do
    case "$1" in
      -s | --skip-lint )      skip_lint="yes";          ;;
      * )                     args+=("$1")
    esac
    shift
  done
}

parse_args "$@"

yarn clean && yarn format

if [[ "$skip_lint" == "no" ]]; then
  yarn lint --short
fi

tsc