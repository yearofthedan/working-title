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

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%b' "$2" >"$project/$1"
}

stage() {
  (cd "$project" || exit 1 && git add -A)
}

comments() {
  comments_in "$project"
}

comments_in() {
  status=0
  (
    cd "$1" || exit 1
    "$root/scripts/check-comments"
  ) >"$work/out" 2>"$work/err" || status=$?
}

write tool.sh '#!/bin/sh\n# help: what the task does.\necho hi\n'
write styles.css '/* shortcut: a limit, until it is lifted. */\nbody { color: red; }\n'
stage
comments
expect_status 0 "a clean tree passes"
expect_out '^every comment in the 2 shell and CSS files starts with an allowed prefix$' "a pass says how many files it read"

write prefixes.sh '#!/bin/sh\n# shortcut: a limit, until it is lifted.\n# workaround: https://github.com/yearofthedan/working-title/issues/72\n# help: what the task does.\n# @ts-expect-error the platform type is wrong here\n# oxlint-disable-next-line no-console\n# @type {number}\necho hi\n'
write prefixes.css '/* shortcut: a limit, until it is lifted. */\nbody { color: red; }\n'
stage
comments
expect_status 0 "each allowed prefix passes"

write plain.sh '#!/bin/sh\necho hi\n# Not allowed.\n'
stage
comments
expect_status 1 "a shell comment without a prefix is refused"
expect_out '^plain\.sh:3$' "the offending shell line is named"
expect_err 'prefixes the coding standard lists' "the failure states the rule"
rm "$project/plain.sh"
stage

write plain.css 'body { color: red; }\n/* Not allowed. */\n'
stage
comments
expect_status 1 "a CSS comment without a prefix is refused"
expect_out '^plain\.css:2$' "the offending CSS line is named"
rm "$project/plain.css"
stage

write linkless.css '/* workaround: patched here. */\nbody { color: red; }\n'
stage
comments
expect_status 1 "a CSS workaround: with no issue link is refused"
expect_out '^linkless\.css:1$' "that comment is named"
rm "$project/linkless.css"
stage

write shebang.sh '#!/bin/sh\necho hi # not at the start of the line\n'
stage
comments
expect_status 0 "the shebang and a # after code pass"
rm "$project/shebang.sh"
stage

write scripts/_test-helpers '# Not allowed.\necho hi\n'
write scripts/_vp '# Not allowed either.\necho hi\n'
stage
comments
expect_status 1 "a sourced helper is read"
expect_out '^scripts/_test-helpers:1$' "the sourced test helper is named"
expect_out '^scripts/_vp:1$' "the sourced vp helper is named"
rm "$project/scripts/_test-helpers" "$project/scripts/_vp"
stage

empty="$work/empty"
mkdir -p "$empty"
(cd "$empty" || exit 1; git init -q -b main .)
comments_in "$empty"
expect_status 1 "a repository with nothing tracked is not a pass"
expect_err 'no tracked file was read' "the failure says nothing was read"

finish
