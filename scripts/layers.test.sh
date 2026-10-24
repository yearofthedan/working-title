#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"
PATH="$root/node_modules/.bin:$PATH"
export PATH

project="$work/project"
layers='domain application ports adapters ui'

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%s\n' "$2" >"$project/$1"
}
may_not_import() {
  case "$1" in
  domain) echo 'application ports adapters ui' ;;
  application) echo 'adapters ui' ;;
  ports) echo 'application adapters ui' ;;
  adapters) echo 'application ui' ;;
  ui) echo 'domain ports adapters' ;;
  esac
}
refused() {
  if [ "$status" -ne 0 ]; then ok "$1"; else no "$1"; fi
}
allowed() {
  if [ "$status" -eq 0 ]; then ok "$1"; else no "$1 (exit $status)"; fi
}
not_out() {
  if grep -qF "$1" "$work/out"; then no "$2"; else ok "$2"; fi
}
not_err() {
  if grep -qF "$1" "$work/err"; then no "$2"; else ok "$2"; fi
}

run_layers() {
  status=0
  (cd "$project" && "$root/scripts/layers") >"$work/out" 2>"$work/err" || status=$?
}

run_do layers
expect_status 0 "the imports this repository has keep the direction"
not_out '(0 modules' "the crawl of this repository read its files"

for from in $layers; do
  for to in $layers; do
    [ "$from" = "$to" ] && continue
    write "src/$from/to-$to.ts" "import { two } from '../$to/two';
export const one = two;"
    write "src/$to/two.ts" "export const two = 'x';"
  done
done
write src/ui/round.ts "import { back } from './back';
export const round = back;"
write src/ui/back.ts "import { round } from './round';
export const back = round;"
write src/domain/enum.ts "import { two } from '../ui/two';
export enum Thing { One }
export const thing = (label: string): Thing => (label === two ? Thing.One : Thing.One);"
write src/ui/type-only.ts "import type { Story } from '../domain/story';
export const summary = (story: Story): string => story.summary;"
write src/domain/story.ts "export interface Story { summary: string }"
write src/ui/re-export-type.ts "export type { Story } from '../domain/story';"
run_layers
refused "a project with an import out of turn is refused"

for from in $layers; do
  for to in $layers; do
    [ "$from" = "$to" ] && continue
    if printf '%s' "$(may_not_import "$from")" | grep -qw "$to"; then
      expect_out "layer-direction-$from: src/$from/to-$to.ts → src/$to/two.ts" \
        "$from importing $to is refused, by the rule for $from"
    else
      not_out "src/$from/to-$to.ts" "$from importing $to is allowed"
    fi
  done
done

expect_out 'layer-direction-domain: src/domain/enum.ts → src/ui/two.ts' \
  "a file of TypeScript syntax is refused"
expect_out 'layer-direction-ui: src/ui/type-only.ts → src/domain/story.ts' \
  "an import of a type over a layer is refused"
expect_out 'layer-direction-ui: src/ui/re-export-type.ts → src/domain/story.ts' \
  "a type re-exported over a layer is refused"

expect_out 'no-circular: src/ui/back.ts →' "a cycle is refused"
expect_out 'src/ui/round.ts →' "the cycle is shown round to back"
expect_out '0002-hexagonal-layers.md' "the refusal links the record"

rm -rf "$project/src"
write src/domain/story.ts 'export type Story = { summary: string };'
write src/application/plan.ts "import type { Story } from '../domain/story';
export const plan = (story: Story) => story.summary;"
run_layers
allowed "imports that point inward are allowed"
not_out 'error' "nothing is reported where there is nothing to refuse"

finish
