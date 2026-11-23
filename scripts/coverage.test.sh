#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
printf '#!/bin/sh\necho "playwright $* COVERAGE_DIR=$COVERAGE_DIR" >>"$VP_LOG"\n' >"$copy/node_modules/.bin/playwright"
chmod +x "$copy/node_modules/.bin/playwright"

mkdir -p "$copy/coverage"
touch "$copy/coverage/stale.json"
run_copy coverage
expect_vp 'test --coverage' "coverage runs the tests with coverage on"
expect_vp_literal "playwright test COVERAGE_DIR=$copy/coverage/raw/journeys" \
  "coverage runs the journeys with their coverage directory set"
expect_vp_literal "node $copy/scripts/_coverage.mjs" "coverage merges the journeys into the tests' coverage"

if awk '/^test --coverage$/ { at = 1 }
  at == 1 && /^playwright test / { at = 2 }
  at == 2 && /^node .*\/scripts\/_coverage\.mjs$/ { found = 1 }
  END { exit !found }' "$VP_LOG"; then
  ok "coverage runs the tests, then the journeys, then the merge"
else
  no "coverage runs the tests, then the journeys, then the merge"
fi

if awk '/^playwright install --with-deps chromium / { at = 1 }
  at == 1 && /^test --coverage$/ { found = 1 }
  END { exit !found }' "$VP_LOG"; then
  ok "coverage installs the browser before the tests that need it"
else
  no "coverage installs the browser before the tests that need it"
fi

if [ -e "$copy/coverage/stale.json" ]; then
  no "coverage empties coverage/ first"
else
  ok "coverage empties coverage/ first"
fi

for flag in -u --update --update=all; do
  run_copy coverage "$flag"
  expect_status 2 "coverage refuses $flag"
done
expect_err 'never write an approved scenario' "coverage says it does not write an approved scenario"

finish
