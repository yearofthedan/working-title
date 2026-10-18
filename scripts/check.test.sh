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
expect_vp 'node .*scripts/_check-links.mjs [^ ]*$' "check refuses a link that does not resolve"
# The names and docs checks run for real, and each reads the tree the caller is in
# rather than the copy, since both read what git tracks in the working directory.
# Their pass messages are what show they ran.
if grep -q 'follows the convention' "$work/out"; then ok "check refuses a file name that breaks the convention"; else no "check refuses a file name that breaks the convention"; fi
if grep -q 'opens with its audience and purpose' "$work/out"; then ok "check refuses a docs page that does not open with its audience and purpose"; else no "check refuses a docs page that does not open with its audience and purpose"; fi
# The half that asks the sites is not run where a merge waits on this: the pattern above would match
# a call with --external, so the flag's absence is asserted too.
if grep -q -- '--external' "$VP_LOG"; then no "check asks no site, which cannot block a merge"; else ok "check asks no site, which cannot block a merge"; fi
if [ "$(grep -c '^pnpm audit --json$' "$VP_LOG")" = 2 ]; then ok "check audits the head and the base"; else no "check audits the head and the base"; fi
expect_vp 'test' "check runs the tests"
expect_vp 'playwright test' "check runs the browser specs"

finish
