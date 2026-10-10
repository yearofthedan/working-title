#!/bin/sh

# Tests for ./do approve: it writes approved files only for a test file named first.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
run_copy approve
expect_status 2 "approve without a test refuses"
expect_err 'Name the test file to approve' "approve without a test says what it needs"

run_copy approve -t thing
expect_status 2 "approve without a test file first refuses"

: >"$copy/thing.test.ts"
run_copy approve "$copy/thing.test.ts"
expect_vp "test --update=all $copy/thing.test.ts" "approve updates only the test file named"

finish
