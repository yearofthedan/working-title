#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy

run_copy approve
expect_status 2 "approve without a file refuses"
expect_err 'Name the scenario file to approve' "approve without a file says what it needs"

run_copy approve nowhere.approved.md
expect_status 2 "approve refuses a file that is not there"
expect_err 'is not a file' "approve says the file is not there"

run_copy approve "$copy/package.json"
expect_status 2 "approve refuses a file that is not a scenario"
expect_err 'is not a scenario file' "approve says what a scenario file is"

: >"$work/outside.approved.md"
run_copy approve "$work/outside.approved.md"
expect_status 2 "approve refuses a file outside the project"
expect_err 'is outside the project' "approve says the file is outside"

mkdir -p "$copy/src/ui/focus/scenarios" "$copy/e2e" "$copy/src/ui/focus"
: >"$copy/src/ui/focus/scenarios/a-rule.approved.md"
: >"$copy/src/ui/focus/not-a-scenario.approved.md"
: >"$copy/e2e/a-journey.approved.md"

run_copy approve "$copy/src/ui/focus/scenarios/a-rule.approved.md"
expect_vp 'test src/scenarios.browser.test.ts -t src/ui/focus/scenarios/a-rule.approved.md' \
  "approve runs the browser entry for a page scenario"

run_copy approve "$copy/e2e/a-journey.approved.md"
expect_vp 'playwright test e2e/scenarios.spec.ts --grep e2e/a-journey.approved.md' \
  "approve runs the Playwright entry for a journey"

run_copy approve "$copy/src/ui/focus/not-a-scenario.approved.md"
expect_status 2 "approve refuses a scenario outside a scenarios folder"
expect_err 'is not a scenario file' "approve says where a page scenario sits"

finish
