#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
for flag in -u --update --update=all; do
  run_copy test "$flag"
  expect_status 2 "test refuses $flag"
done
expect_err 'never write an approved scenario' "test says it does not write an approved scenario"
expect_err 'Verify the intent of the update' "test asks for the intent of the update to be verified"

finish
