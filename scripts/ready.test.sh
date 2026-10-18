#!/bin/sh

# Tests for ./do ready: it marks a pull request ready only when the tree, CI on the
# head commit and the body's tables back it, and names each condition that fails.
# gh is stubbed with the answers its --json -q filters give; a real run against a
# pull request checks those filters.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

repo="$work/repo"
git init -q -b 73-a-line "$repo"
git -C "$repo" config user.email t@example.com
git -C "$repo" config user.name t
printf 'one\n' >"$repo/notes.txt"
git -C "$repo" add notes.txt
git -C "$repo" commit -qm one
head=$(git -C "$repo" rev-parse HEAD)
other=1111111111111111111111111111111111111111

GH_LOG="$work/gh-calls"
GH_HEAD_FILE="$work/gh-head"
GH_BODY="$work/gh-body"
GH_CHECKS="$work/gh-checks"
GH_RUNS="$work/gh-runs"
export GH_LOG GH_HEAD_FILE GH_BODY GH_CHECKS GH_RUNS

cat >"$work/bin/gh" <<'STUB'
#!/bin/sh
echo "gh $*" >>"$GH_LOG"
case "$1 $2" in
'pr view')
  case "$*" in
  *headRefOid*) cat "$GH_HEAD_FILE" ;;
  *body*) cat "$GH_BODY" ;;
  esac
  ;;
'pr checks')
  if [ ! -s "$GH_CHECKS" ]; then
    echo 'no checks reported' >&2
    exit 1
  fi
  cat "$GH_CHECKS"
  # As gh does: 8 while a check is pending, 1 once one fails.
  if grep -q '^pending' "$GH_CHECKS"; then exit 8; fi
  if grep -q '^fail' "$GH_CHECKS"; then exit 1; fi
  ;;
'pr ready')
  echo "marked ready"
  ;;
'api '*)
  line=$(grep "^$2 " "$GH_RUNS") || exit 1
  echo "${line#* }"
  ;;
esac
STUB
chmod +x "$work/bin/gh"

run="https://github.com/yearofthedan/working-title/actions/runs/101/job/202"
run_path="repos/yearofthedan/working-title/actions/jobs/202"

body() { # $1 the For review lines, $2 the table rows
  {
    printf 'Part of #73\r\n\r\n## Acceptance criteria\r\n\r\n'
    printf '| Acceptance criterion | Test | Run |\r\n| --- | --- | --- |\r\n'
    printf '%s' "$2"
    printf '\r\n| Break | Cases that failed |\r\n| --- | --- |\r\n| a break | a case |\r\n'
    printf '\r\n## Decisions\r\n\r\n- [ ] a box outside For review\r\n\r\n## For review\r\n\r\n%s' "$1"
  } >"$GH_BODY"
}

ticked='- [x] Approved files listed
- [x] docs/architecture.md unchanged
'
rows="| Refuses a thing | \`a test\` | [CI check]($run) on $head |
| Names the thing | \`a test with a \\| pipe\` | local: \`./do test\` |
"

passing() {
  printf '%s\n' "$head" >"$GH_HEAD_FILE"
  body "$ticked" "$rows"
  printf 'pass check\npass mutate\nskipping deploy\n' >"$GH_CHECKS"
  printf '%s %s success\n' "$run_path" "$head" >"$GH_RUNS"
  : >"$GH_LOG"
}

ready() {
  status=0
  (cd "$repo" && "$root/do" ready 77) >"$work/out" 2>"$work/err" || status=$?
}

refused() { # $1 what the case is
  if grep -q '^gh pr ready' "$GH_LOG"; then no "$1 leaves the pull request in draft"; else ok "$1 leaves the pull request in draft"; fi
}

expect_one_failure() { # $1 what the case is
  count=$(grep -c '^- ' "$work/err" || true)
  if [ "$count" -eq 1 ]; then ok "$1 names that condition alone"; else no "$1 names that condition alone ($count named)"; fi
}

passing
ready
expect_status 0 "marks the pull request ready when every condition holds"
if grep -q '^gh pr ready 77' "$GH_LOG"; then ok "runs gh pr ready on the pull request"; else no "runs gh pr ready on the pull request"; fi

passing
printf 'two\n' >"$repo/notes.txt"
ready
expect_status 1 "refuses with uncommitted changes"
expect_err 'notes.txt' "names the uncommitted path"
refused "uncommitted changes"
expect_one_failure "uncommitted changes"
git -C "$repo" checkout -q notes.txt

passing
printf 'new\n' >"$repo/fresh.txt"
ready
expect_status 1 "refuses with an untracked file"
expect_err 'fresh.txt' "names the untracked path"
rm "$repo/fresh.txt"

passing
printf '%s\n' "$other" >"$GH_HEAD_FILE"
printf '%s %s success\n' "$run_path" "$other" >"$GH_RUNS"
body "$ticked" "| Refuses a thing | \`a test\` | [CI check]($run) on $other |
"
ready
expect_status 1 "refuses when the local head is not the pull request's head"
expect_err "${other%"${other#???????}"}" "names the pull request's head"
refused "an unpushed head"
expect_one_failure "an unpushed head"

passing
printf 'pass check\nfail mutate\n' >"$GH_CHECKS"
ready
expect_status 1 "refuses with a failing check"
expect_err 'mutate' "names the failing check"
refused "a failing check"
expect_one_failure "a failing check"

passing
printf 'pass check\npending mutate\n' >"$GH_CHECKS"
ready
expect_status 1 "refuses with a pending check"
expect_err 'mutate' "names the pending check"

passing
printf 'pass check\ncancel mutate\n' >"$GH_CHECKS"
ready
expect_status 1 "refuses with a cancelled check"

passing
: >"$GH_CHECKS"
ready
expect_status 1 "refuses when no check is reported"
expect_err 'no check' "says no check was reported"
refused "no check"

passing
body '- [x] Approved files listed
- [ ] docs/architecture.md unchanged
' "$rows"
ready
expect_status 1 "refuses with an unticked For review box"
expect_err 'docs/architecture.md unchanged' "names the unticked box"
refused "an unticked box"
expect_one_failure "an unticked box"

passing
body "$ticked" ''
ready
expect_status 1 "refuses a table with no rows"
expect_err 'no rows' "says the table has no rows"

passing
printf 'Part of #73\n\n## Acceptance criteria\n\n| Acceptance criterion | Test | Run |\n| --- | --- | --- |\n%s' "$rows" >"$GH_BODY"
ready
expect_status 1 "refuses a body with no For review section"
expect_err 'For review' "says the For review section is missing"

passing
body "$ticked" "| Refuses a thing | \`a test\` | [CI check]($run) on $head |
| Names the thing | \`a test\` |  |
"
ready
expect_status 1 "refuses a row with no Run cell"
expect_err 'Names the thing' "names the row with no Run cell"
refused "an empty Run cell"
expect_one_failure "an empty Run cell"

passing
body "$ticked" "| Refuses a thing | \`a test\` | [CI check]($run) on $head |
| Names the thing | \`a test\` |
"
ready
expect_status 1 "refuses a row missing its Run column"

passing
printf 'Part of #73\n\n## For review\n\n%s' "$ticked" >"$GH_BODY"
ready
expect_status 1 "refuses a body with no Acceptance criteria section"
expect_err 'Acceptance criteria' "says the Acceptance criteria section is missing"

passing
body "$ticked" '|  |  |  |
'
ready
expect_status 1 "refuses the template's empty row"

passing
printf '%s %s success\n' "$run_path" "$other" >"$GH_RUNS"
ready
expect_status 1 "refuses a cited run on another commit"
expect_err 'Refuses a thing' "names the row citing a run on another commit"
refused "a run on another commit"
expect_one_failure "a run on another commit"

passing
printf '%s %s failure\n' "$run_path" "$head" >"$GH_RUNS"
ready
expect_status 1 "refuses a cited run that did not pass"
expect_err 'failure' "says how the cited run ended"
expect_one_failure "a run that did not pass"

passing
: >"$GH_RUNS"
ready
expect_status 1 "refuses a cited run gh cannot read"
expect_err "$run" "names the run gh cannot read"

passing
body "$ticked" "| Refuses a thing | \`a test\` | [CI check](https://github.com/yearofthedan/working-title/actions/runs/101) on $head |
"
printf 'repos/yearofthedan/working-title/actions/runs/101 %s success\n' "$head" >"$GH_RUNS"
ready
expect_status 0 "reads a link to a whole run as well as one to a job"

passing
body "$ticked" "| Refuses a thing | \`a test\` | local run on defaced, then 1a2b3c4 |
"
ready
expect_status 0 "leaves a cell with no run link alone"

passing
printf 'two\n' >"$repo/notes.txt"
printf 'pass check\nfail mutate\n' >"$GH_CHECKS"
body '- [ ] docs/architecture.md unchanged
' "$rows"
ready
count=$(grep -c '^- ' "$work/err" || true)
if [ "$count" -eq 3 ]; then ok "names every condition that fails at once"; else no "names every condition that fails at once ($count named)"; fi
git -C "$repo" checkout -q notes.txt

status=0
(cd "$repo" && "$root/do" ready) >"$work/out" 2>"$work/err" || status=$?
expect_status 2 "asks for the pull request when none is named"

finish
