#!/bin/sh

# Tests for ./do precommit: it hands the staged files to vp staged. Its credential
# scan is in secrets.test.sh.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
(cd "$copy" && "$copy/do" precommit) >"$work/out" 2>"$work/err" || true
expect_vp 'staged' "precommit runs vp staged"

finish
