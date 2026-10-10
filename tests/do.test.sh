#!/bin/sh

# Tests for ./do, with a stub omp that records what it is asked to do.
# Run: sh tests/do.test.sh

set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

mkdir -p "$work/bin"
cat >"$work/bin/omp" <<'STUB'
#!/bin/sh
echo "$*" >> "$OMP_LOG"
if [ "$1 $2" = "plugin list" ]; then cat "$OMP_LIST"; fi
if [ "$1 $2" = "plugin marketplace" ] && [ "$3" = "list" ]; then cat "$OMP_MARKETPLACES"; fi
STUB
chmod +x "$work/bin/omp"

PATH="$work/bin:$PATH"
OMP_LOG="$work/calls"
OMP_LIST="$work/plugins.json"
OMP_MARKETPLACES="$work/marketplaces"
export PATH OMP_LOG OMP_LIST OMP_MARKETPLACES

failures=0
ok() { printf 'ok   %s\n' "$1"; }
no() {
  printf 'FAIL %s\n' "$1"
  failures=$((failures + 1))
}

status=0
run_do() {
  status=0
  "$root/do" "$@" >"$work/out" 2>"$work/err" || status=$?
}

# A machine with no marketplaces configured and nothing installed.
fresh() {
  printf '{"npm":[],"marketplace":[]}' >"$OMP_LIST"
  : >"$OMP_MARKETPLACES"
  : >"$OMP_LOG"
}

expect_status() { if [ "$status" -eq "$1" ]; then ok "$2"; else no "$2 (exit $status)"; fi; }
expect_err() { if grep -q "$1" "$work/err"; then ok "$2"; else no "$2"; fi; }
expect_call() { if grep -q "$1" "$OMP_LOG"; then ok "$2"; else no "$2"; fi; }
expect_no_call() { if grep -q "$1" "$OMP_LOG"; then no "$2"; else ok "$2"; fi; }

fresh
run_do
expect_status 2 "no task exits non-zero"
expect_err 'usage: ./do' "no task prints the tasks"
expect_no_call 'plugin' "no task runs nothing"

fresh
run_do frobnicate
expect_status 2 "an unknown task exits non-zero"
expect_err 'usage: ./do' "an unknown task prints the tasks"
expect_no_call 'plugin' "an unknown task runs nothing"

fresh
run_do setup
expect_status 0 "setup succeeds on a fresh machine"
expect_call 'plugin marketplace add DietrichGebert/ponytail' "setup adds the marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"

printf '{"npm":[],"marketplace":[{"id":"ponytail@ponytail","scope":"user"}]}' >"$OMP_LIST"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when Ponytail is installed"
expect_no_call 'marketplace add' "setup does not re-add the marketplace"
expect_no_call 'plugin install' "setup re-installs nothing"

printf '{"npm":[],"marketplace":[]}' >"$OMP_LIST"
printf 'ponytail  DietrichGebert/ponytail\n' >"$OMP_MARKETPLACES"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when the marketplace is already configured"
expect_no_call 'marketplace add' "setup does not re-add the marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"

mkdir -p "$work/nowhere"
status=0
PATH="$work/nowhere" "$root/do" setup >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "setup fails when omp is not on PATH"
expect_err 'omp is not on your PATH' "setup says what is missing"

# --- lessons: the entry past the window is named, the others are left alone

lesson_repo="$work/lessons-repo"
mkdir -p "$lesson_repo/docs"
(
  cd "$lesson_repo" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
  for n in one two three; do
    printf '%s\n' "$n" >"f-$n"
    git add "f-$n"
    git commit -qm "$n"
  done
)
printf '%s\n%s\n\n' "$(git -C "$lesson_repo" rev-list --max-parents=0 main)" \
  "$(git -C "$lesson_repo" rev-parse main)" >"$work/gh-shas"
cat >"$work/bin/gh" <<'STUB'
#!/bin/sh
if [ "$1 $2" = "pr view" ]; then sed -n "${3}p" "$GH_SHAS"; fi
STUB
chmod +x "$work/bin/gh"
GH_SHAS="$work/gh-shas"
export GH_SHAS
cat >"$lesson_repo/docs/lessons.md" <<'MD'
# Lessons

| Lesson | Found in | Tripwire |
| --- | --- | --- |
| An old one | [#1](u) | none |
| A fresh one | [#2](u) | none |
| One still open | [#3](u) | none |
MD

lessons_run() {
  status=0
  (cd "$lesson_repo" && LESSON_WINDOW="$1" "$root/do" lessons docs/lessons.md) >"$work/out" 2>"$work/err" || status=$?
}

lessons_run 1
expect_status 1 "lessons exits non-zero when an entry is past the window"
if grep -q '^drop:.*#1' "$work/out"; then ok "lessons names the entry past the window"; else no "lessons names the entry past the window"; fi
if grep -qE '^drop:.*#(2|3)' "$work/out"; then no "lessons leaves the fresh and unmerged rows alone"; else ok "lessons leaves the fresh and unmerged rows alone"; fi

lessons_run 50
expect_status 0 "lessons exits zero when nothing is past the window"
if grep -q 'nothing past the window' "$work/out"; then ok "lessons says nothing is past the window"; else no "lessons says nothing is past the window"; fi

printf '\n%d failed\n' "$failures"
[ "$failures" -eq 0 ]
