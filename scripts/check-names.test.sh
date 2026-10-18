#!/bin/sh

# Tests for ./do check-names: the rule over a tracked file's name, the last part
# of the path, and the three kinds of exception.

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

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf 'x\n' >"$project/$1"
}

# Only what git tracks is read, so the fixture stages what a case wrote.
stage() {
  (cd "$project" || exit 1 && git add -A)
}

names() {
  names_in "$project"
}

names_in() {
  status=0
  (
    cd "$1" || exit 1
    "$root/scripts/check-names"
  ) >"$work/out" 2>"$work/err" || status=$?
}

# A clean tree passes, and says how many names it read, so a run over nothing
# cannot read as a pass.
write docs/good-name.md
write src/good-name.ts
stage
names
expect_status 0 "a clean tree passes"
expect_out 'every name of the 2 tracked files follows the convention' "a pass says how many names it read"

# An uppercase letter and an underscore each break the rule, and each is named
# with the rule.
write docs/BadName.md
write src/bad_name.ts
stage
names
expect_status 1 "an uppercase letter and an underscore break the rule"
expect_out '^docs/BadName.md$' "the offending file is named"
expect_out '^src/bad_name.ts$' "the other offending file is named too"
expect_err 'lowercase kebab-case in every dot-separated part' "the failure states the rule"
rm "$project/docs/BadName.md" "$project/src/bad_name.ts"
stage

# A directory is not judged: only the last part of the path is a name, so the
# uppercase directory is not the offence, the name under it is.
write .github/ISSUE_TEMPLATE/badName.md
stage
names
expect_status 1 "a name under an uppercase directory is judged"
expect_out '^\.github/ISSUE_TEMPLATE/badName\.md$' "that name is named"
rm "$project/.github/ISSUE_TEMPLATE/badName.md"
write .github/ISSUE_TEMPLATE/good-name.md
stage
names
expect_status 0 "a name under the uppercase directory passes, so the directory is not judged"
rm -r "$project/.github/ISSUE_TEMPLATE"
stage

# A leading dot is ignored, and the rest of the name still has to follow.
write .gitignore
write .Bad
stage
names
expect_status 1 "the rest of a leading-dot name still follows the rule"
expect_out '^\.Bad$' "the dotfile that breaks the rule is named"
if grep -q '^\.gitignore$' "$work/out"; then no "the dotfile that follows the rule is not named"; else ok "the dotfile that follows the rule is not named"; fi
rm "$project/.Bad"
stage

# The names a tool looks for pass wherever they sit.
write AGENTS.md
write README.md
write SKILL.md
write RULES.md
write .github/pull_request_template.md
stage
names
expect_status 0 "the names a tool looks for pass"

# A leading _ marks a file as not a task, only directly in scripts/.
write scripts/_helper
write scripts/_helper.sh
write docs/_x.md
write scripts/a/b_thing.ts
stage
names
expect_status 1 "a leading _ outside scripts/ is not the exception"
expect_out '^docs/_x\.md$' "the file with a leading _ outside scripts/ is named"
expect_out '^scripts/a/b_thing\.ts$' "the file in a subdirectory is named"
if grep -q '^scripts/_helper' "$work/out"; then no "a leading _ on a file in scripts/ is not named"; else ok "a leading _ on a file in scripts/ is not named"; fi
rm "$project/docs/_x.md" "$project/scripts/a/b_thing.ts"
stage
write scripts/a/_helper.sh
stage
names
expect_status 1 "a leading _ on a file below scripts/ is not the exception either"
expect_out '^scripts/a/_helper\.sh$' "that file is named"
if grep -q '^scripts/_helper' "$work/out"; then no "a leading _ on a file in scripts/ is not named below scripts/ either"; else ok "a leading _ on a file in scripts/ is not named below scripts/ either"; fi
rm -r "$project/scripts/a"
stage
write scripts/_Bad
stage
names
expect_status 1 "the name after the leading _ still follows the rule"
expect_out '^scripts/_Bad$' "that name is named"
rm "$project/scripts/_Bad"
stage

# The patch pnpm-workspace.yaml names passes. Its name is the package's, so the
# exception is that exact path and a name near it still has to follow.
write 'patches/@stryker-mutator__vitest-runner@10.0.0.patch'
write patches/another-patch.patch
stage
names
expect_status 0 "the patch pnpm-workspace.yaml names passes"

write patches/another_patch.patch
rm "$project/patches/another-patch.patch"
stage
names
expect_status 1 "a patch named otherwise is judged by the rule"
expect_out '^patches/another_patch\.patch$' "that patch is named"
rm "$project/patches/another_patch.patch"
stage

# A name git does not track is not read.
write docs/Untracked.md
write mx/Untracked.ts
names
expect_status 0 "a name git does not track is not read"

# A name git quotes — one holding a newline — is still one name, and still read.
mkdir -p "$project/odd"
printf 'x\n' >"$project/odd/$(printf 'a\nb').md"
stage
names
expect_status 1 "a name holding a newline is read, and breaks the rule"

# A run that read nothing is not a pass.
empty="$work/empty"
mkdir -p "$empty"
(cd "$empty" || exit 1; git init -q -b main .)
names_in "$empty"
expect_status 1 "a repository with nothing tracked is not a pass"
expect_err 'no tracked file was read' "the failure says nothing was read"

finish
