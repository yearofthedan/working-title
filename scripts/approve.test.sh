#!/bin/sh

# Tests for ./do approve: it picks a scenario's runner by where the file is, and asks that
# runner to record what it observed.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy

run_copy approve
expect_status 2 "approve without a file refuses"
expect_err 'Name the scenario file to approve' "approve without a file says what it needs"

run_copy approve nowhere.approved.md
expect_status 2 "approve refuses a file that is not there"

mkdir -p "$copy/src/ui/focus/scenarios" "$copy/e2e"
: >"$copy/src/ui/focus/scenarios/a-rule.approved.md"
: >"$copy/e2e/a-journey.approved.md"

run_copy approve "$copy/src/ui/focus/scenarios/a-rule.approved.md"
expect_vp 'test src/scenarios.browser.test.ts -t src/ui/focus/scenarios/a-rule.approved.md' \
  "approve runs the browser entry for a page scenario"

run_copy approve "$copy/e2e/a-journey.approved.md"
expect_vp 'playwright test e2e/scenarios.spec.ts --grep e2e/a-journey.approved.md' \
  "approve runs the Playwright entry for a journey"

finish
