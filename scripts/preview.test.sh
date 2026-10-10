#!/bin/sh

# Tests for ./do preview: it builds, then serves the build.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
run_copy preview
expect_vp 'build' "preview builds the app"
expect_vp 'preview' "preview serves the build"

finish
