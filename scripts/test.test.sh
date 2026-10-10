#!/bin/sh

# Tests for ./do test: it never writes approved files.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
for flag in -u --update --update=all; do
  run_copy test "$flag"
  expect_status 2 "test refuses $flag"
done
expect_err 'never write approved files' "test says it does not write approved files"
expect_err 'Verify the intent of the update' "test asks for the intent of the update to be verified"

finish
