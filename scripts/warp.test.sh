#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"
PATH="$root/node_modules/.bin:$PATH"
export PATH

project="$work/project"

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%s\n' "$2" >"$project/$1"
}

run_warp() {
  status=0
  (cd "$project" && "$root/scripts/warp") >"$work/out" 2>"$work/err" || status=$?
}
run_warp_in() {
  status=0
  (cd "$1" && "$root/scripts/warp") >"$work/out" 2>"$work/err" || status=$?
}

advisory() {
  if [ "$status" -eq 0 ]; then ok "$1"; else no "$1 (exit $status)"; fi
}
not_out() {
  if grep -qF "$1" "$work/out"; then no "$2"; else ok "$2"; fi
}

run_do warp
expect_status 0 "this repository is reported without refusing"
expect_out 'findings' "the findings it carries are printed"
not_out 'worsened' "the report is of the codebase, not of a change"

run_do warp --fail
expect_status 1 "adding --fail refuses"

run_warp_in "$root/src"
expect_status 0 "the repository is reported from inside one of its folders"
expect_out 'findings' "the same report comes from there"

write tsconfig.json '{
  "compilerOptions": { "strict": true },
  "include": ["**/*.ts"]
}'
write warp.config.ts 'import { archetype, defineConfig, dir } from "@yearofthedan/warp";

const app = archetype("app").contains((c) =>
  c.module("domain", dir("src/domain")).module("ui", dir("src/ui")),
);

export default defineConfig({ root: app });
'
write src/domain/story.ts 'export type Story = { summary: string };'
write src/ui/card.ts 'export const card = (): string => "card";'

run_warp
advisory "a tree whose imports keep the boundaries is reported"
expect_out 'No findings' "nothing is reported where the boundaries hold"

write src/ui/card.ts "import type { Story } from '../domain/story';
export const card = (story: Story): string => story.summary;"
run_warp
advisory "an import out of turn is reported without refusing"
expect_out 'src/ui/card.ts' "the file that imports is named"
expect_out 'src/domain/story.ts' "the file it reached is named"
expect_out 'keeps private' "the reason says why it is refused"

write src/ui/card.ts 'export const card = (): string => "card";'
run_warp
expect_out 'No findings' "putting the import back reports nothing"

write src/ui/plain.ts "import { card } from './card';
export const two = card;"
run_warp
expect_out 'No findings' "an import inside a module is allowed"
not_out 'plain.ts' "the rule says nothing where the reach allows it"

finish
