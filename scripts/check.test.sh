#!/bin/sh

# Tests for ./do check: what it runs, in order.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
run_copy check
expect_status 0 "check succeeds when vp does"
expect_vp 'check' "check runs vp check from node_modules"
expect_vp 'depcruise --config .*' "check refuses an import out of turn"
expect_vp_literal 'secretlint **/*' "check scans the project for secrets"
expect_vp 'pnpm audit --json' "check audits the lockfile"
expect_vp 'node .*scripts/_links.mjs.*' "check refuses a link that does not resolve"
if [ "$(grep -c '^pnpm audit --json$' "$VP_LOG")" = 2 ]; then ok "check audits the head and the base"; else no "check audits the head and the base"; fi
expect_vp 'test' "check runs the tests"
expect_vp 'playwright test' "check runs the browser specs"

finish
