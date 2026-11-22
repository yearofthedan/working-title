#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
run_copy coverage
expect_vp 'test --coverage' "coverage runs the tests with coverage on"
for flag in -u --update --update=all; do
  run_copy coverage "$flag"
  expect_status 2 "coverage refuses $flag"
done
expect_err 'never write an approved scenario' "coverage says it does not write an approved scenario"

finish
