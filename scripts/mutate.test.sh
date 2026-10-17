#!/bin/sh

# Tests for ./do mutate: which files it mutates, and what a failing score does to the run. The
# project is its own, holding the paths the config names, so a run leaves this repository alone.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

project="$work/project"
report="$project/reports/mutation/mutation.json"

mkdir -p "$project"
cp "$root/do" "$project/do"
cp -R "$root/scripts" "$project/scripts"
# The configs are this repository's own, so dropping a setting from one fails a case here.
# node_modules is the real one: Stryker and the runner it loads are what is under test.
cp "$root/package.json" "$root/tsconfig.json" "$root/vite.config.ts" \
  "$root/stryker.config.mjs" "$root/stryker.vitest.config.ts" "$project/"
ln -s "$root/node_modules" "$project/node_modules"

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%s\n' "$2" >"$project/$1"
}

write src/domain/greeting.ts "export const greeting = (name: string): string => \`Hello, \${name}!\`;"
# The suite a test sits in is part of the name a mutant's run filters by, which is what the
# runner patch is about: move this test out of its `describe` and the case below passes on a
# run that tests nothing (https://github.com/stryker-mutator/stryker-js/issues/6210).
write src/domain/greeting.test.ts "import { describe, expect, it } from 'vite-plus/test';
import { greeting } from './greeting';

describe('greeting', () => {
  it('names the writer', () => {
    expect(greeting('Ada')).toBe('Hello, Ada!');
  });
});"
write src/domain/twice.ts 'export const twice = (n: number): number => n * 2;'
# A test that passes on code that halves instead of doubling, which leaves a mutant alive.
write src/domain/twice.test.ts "import { describe, expect, it } from 'vite-plus/test';
import { twice } from './twice';

describe('twice', () => {
  it('doubles nothing', () => {
    expect(twice(0)).toBe(0);
  });
});"
write src/application/use.ts "import { greeting } from '../domain/greeting';

export const say = (name: string): string => greeting(name);"
write src/application/use.test.ts "import { describe, expect, it } from 'vite-plus/test';
import { say } from './use';

describe('say', () => {
  it('greets by name', () => {
    expect(say('Ada')).toBe('Hello, Ada!');
  });
});"
write src/ui/deep.ts "export const deep = (n: number): number => n * 3;"
write src/ui/deep.test.ts "import { describe, expect, it } from 'vite-plus/test';
import { deep } from './deep';

describe('deep', () => {
  it('triples', () => {
    expect(deep(2)).toBe(6);
  });
});"

run_mutate() {
  status=0
  (cd "$project" && "$project/do" mutate) >"$work/out" 2>"$work/err" || status=$?
}

# The report, as one line per fact the cases below read. A mutant a module's load alone runs is
# killed without the tests' names being matched, so `per-test` holds the ones a test covers, which
# is where the runner patch shows (https://stryker-mutator.io/docs/mutation-testing-elements/static-mutants).
summarise() {
  node -e '
    const { readFileSync } = require("node:fs");
    const files = Object.entries(JSON.parse(readFileSync(process.argv[1], "utf8")).files);
    const mutants = (file) => file[1].mutants;
    const statuses = (mutants) => mutants.map((mutant) => mutant.status).sort().join(" ");
    console.log(`files: ${files.map((file) => file[0]).sort().join(" ")}`);
    console.log(`per-test: ${statuses(files.flatMap(mutants).filter((mutant) => !mutant.static))}`);
  ' "$report" >"$work/summary" 2>"$work/summary-err" || {
    echo "reading $report failed:" >&2
    sed 's/^/     /' "$work/summary-err" >&2
  }
}

expect_summary() {
  if grep -qE "$1" "$work/summary"; then
    ok "$2"
  else
    no "$2"
    sed 's/^/     /' "$work/summary" >&2
  fi
}

run_mutate
# The fixture scores 80% of its five mutants, under the 90 the config sets, so the run fails; the
# line it prints is what tells that from a crash
# (https://stryker-mutator.io/docs/stryker-js/configuration#thresholds-object).
expect_status 1 "a run under the threshold fails"
expect_out 'under breaking threshold' "and says the threshold is what failed it"

summarise
expect_summary '^files: src/application/use.ts src/domain/greeting.ts src/domain/twice.ts$' \
  "only the domain and application sources are mutated"
expect_summary '^per-test: .*Killed' "a mutant a test covers is killed"

# The workflow caches the file a run leaves at Stryker's default path, so the setting and the
# workflow's copy of that path are held together here
# (https://stryker-mutator.io/docs/stryker-js/configuration#incremental-boolean).
if [ -f "$project/reports/stryker-incremental.json" ]; then
  ok "the run leaves the file the report continues from"
else
  no "the run leaves the file the report continues from"
fi
if grep -qF 'reports/stryker-incremental.json' "$root/.github/workflows/mutate.yml"; then
  ok "the workflow caches that file"
else
  no "the workflow caches that file"
fi

finish
