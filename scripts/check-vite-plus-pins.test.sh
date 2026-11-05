#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

project="$work/project"
mkdir -p "$project"
(
  cd "$project" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
)

catalog() {
  printf 'overrides:\n  vite@*: %s\ncatalog:\n%b' "'catalog:'" "$1" >"$project/pnpm-workspace.yaml"
}

pins() {
  status=0
  (
    cd "$project" || exit 1
    "$root/scripts/check-vite-plus-pins"
  ) >"$work/out" 2>"$work/err" || status=$?
}

catalog '  vite: npm:@voidzero-dev/vite-plus-core@1.3.0\n  vite-plus: 1.3.0\n'
pins
expect_status 0 "a core and vite-plus on one version pass"
expect_out '^the Vite+ core and vite-plus are both 1.3.0$' "a pass names the version"

catalog '  vite: npm:@voidzero-dev/vite-plus-core@1.1.0\n  vite-plus: 1.3.0\n'
pins
expect_status 1 "a core behind vite-plus is refused"
expect_err 'vite-plus-core@1.1.0 but vite-plus is 1.3.0' "a refusal names both versions"

catalog '  vite-plus: 1.3.0\n'
pins
expect_status 1 "a catalog with no core entry is refused"

finish
