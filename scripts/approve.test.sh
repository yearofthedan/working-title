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

mkdir -p "$copy/src/ui/focus/scenarios" "$copy/e2e" "$copy/src/ui/focus" "$copy/src/scenarios" "$copy/src/ui/none/scenarios"
: >"$copy/src/ui/focus/scenarios/a-rule.approved.md"
: >"$copy/src/ui/focus/not-a-scenario.approved.md"
: >"$copy/e2e/a-journey.approved.md"
: >"$copy/src/scenarios/a-rule.approved.md"
: >"$copy/src/ui/none/scenarios/a-rule.approved.md"
printf 'const glob = "/src/ui/focus/scenarios/*.approved.md";\n' >"$copy/src/ui/focus/focus.component.test.ts"
printf 'const glob = "/src/ui/focus/scenarios/*.approved.md";\n' >"$copy/src/ui/focus/focus.app.test.ts"
printf 'const glob = "/src/scenarios/*.approved.md";\n' >"$copy/src/app.app.test.ts"

run_copy approve "$copy/src/ui/focus/scenarios/a-rule.approved.md"
expect_vp 'test src/ui/focus/focus.component.test.ts -t src/ui/focus/scenarios/a-rule.approved.md' \
  "approve runs the component entry beside the folder"

printf 'const glob = "/src/ui/other/scenarios/*.approved.md";\n' >"$copy/src/ui/focus/focus.component.test.ts"
run_copy approve "$copy/src/ui/focus/scenarios/a-rule.approved.md"
expect_vp 'test src/ui/focus/focus.app.test.ts -t src/ui/focus/scenarios/a-rule.approved.md' \
  "approve skips a sibling without the glob for the one with it"

run_copy approve "$copy/src/scenarios/a-rule.approved.md"
expect_vp 'test src/app.app.test.ts -t src/scenarios/a-rule.approved.md' \
  "approve runs the app entry for a root scenario"

run_copy approve "$copy/src/ui/none/scenarios/a-rule.approved.md"
expect_status 2 "approve refuses a scenarios folder with no test beside it"
expect_err 'has no test beside it' "approve says the folder has no test beside it"

run_copy approve "$copy/e2e/a-journey.approved.md"
expect_vp 'playwright test e2e/scenarios.spec.ts --grep e2e/a-journey.approved.md' \
  "approve runs the Playwright entry for a journey"

run_copy approve "$copy/src/ui/focus/not-a-scenario.approved.md"
expect_status 2 "approve refuses a scenario outside a scenarios folder"
expect_err 'is not a scenario file' "approve says where a page scenario sits"

finish
