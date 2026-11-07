#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

project="$work/project"
mkdir -p "$project/bin"
(
  cd "$project" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
)
project=$(cd "$project" && pwd -P)

VP_FILES="$work/vp-files"
PW_FILES="$work/pw-files"
: >"$VP_FILES"
: >"$PW_FILES"
export VP_FILES PW_FILES

printf '#!/bin/sh\n' >"$project/bin/vp"
cat >>"$project/bin/vp" <<'STUB'
[ -z "${VP_EMPTY:-}" ] || { printf '[]\n'; exit 0; }
printf '[\n'
while IFS= read -r file; do
  printf '  {\n    "file": "%s",\n    "projectName": "node"\n  },\n' "$file"
done <"$VP_FILES"
printf '  {\n    "file": "%s/__stub__.test.ts",\n    "projectName": "node"\n  }\n]\n' "$(pwd)"
STUB
chmod +x "$project/bin/vp"

printf '#!/bin/sh\n' >"$project/bin/playwright"
cat >>"$project/bin/playwright" <<'STUB'
printf 'Listing tests:\n'
[ -z "${PW_EMPTY:-}" ] || exit 0
while IFS= read -r file; do
  printf '  %s:1:1 › a stub test\n' "$file"
done <"$PW_FILES"
printf '  __stub__.spec.ts:1:1 › a stub test\n'
STUB
chmod +x "$project/bin/playwright"

PATH="$project/bin:$PATH"
export PATH

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%s\n' "${2:-x}" >"$project/$1"
}

stage() {
  (cd "$project" || exit 1 && git add -A)
}

vp_lists() {
  : >"$VP_FILES"
  for file in "$@"; do printf '%s/%s\n' "$project" "$file" >>"$VP_FILES"; done
}

pw_lists() {
  : >"$PW_FILES"
  for file in "$@"; do printf '%s\n' "$file" >>"$PW_FILES"; done
}

check() {
  status=0
  (
    cd "$project" || exit 1
    "$root/scripts/check-test-files"
  ) >"$work/out" 2>"$work/err" || status=$?
}

write src/x.test.ts
write src/ui/card/card.component.test.ts
write e2e/z.spec.ts
vp_lists src/x.test.ts src/ui/card/card.component.test.ts
pw_lists z.spec.ts
stage
check
expect_status 0 "a test file every project runs passes"
expect_out 'every one of the 3 test files is run by a project' "a pass says how many test files it read"

write src/x.spec.ts
stage
check
expect_status 1 "a spec file no project runs is refused"
expect_out '^src/x\.spec\.ts$' "the spec file is named"
expect_err 'docs/standards/testing\.md' "the failure names the standard"

write src/ui/x.browser.test.ts
stage
check
expect_status 1 "a stale browser test file is refused"
expect_out '^src/ui/x\.browser\.test\.ts$' "the stale browser test file is named"
expect_err 'docs/standards/testing\.md' "that failure names the standard too"

VP_EMPTY=1
export VP_EMPTY
check
expect_status 1 "a vp listing that reports nothing is a failure"
expect_err 'vp test list --filesOnly --json listed no test file' "the failure says the vp listing was empty"
unset VP_EMPTY

PW_EMPTY=1
export PW_EMPTY
check
expect_status 1 "a Playwright listing that reports nothing is a failure"
expect_err 'playwright test --list listed no test file' "the failure says the Playwright listing was empty"
unset PW_EMPTY

finish