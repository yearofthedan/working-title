#!/bin/sh

# Tests for ./do and the tasks in scripts/, with stubs for omp and gh that record
# what they are asked to do. Run: sh tests/do.test.sh, or ./do test, which runs it.

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

expect_out() { if grep -q "$1" "$work/out"; then ok "$2"; else no "$2"; fi; }
expect_status() { if [ "$status" -eq "$1" ]; then ok "$2"; else no "$2 (exit $status)"; fi; }
expect_err() { if grep -q "$1" "$work/err"; then ok "$2"; else no "$2"; fi; }
expect_call() { if grep -q "$1" "$OMP_LOG"; then ok "$2"; else no "$2"; fi; }
expect_no_call() { if grep -q "$1" "$OMP_LOG"; then no "$2"; else ok "$2"; fi; }

fresh
run_do
expect_status 0 "no task exits zero"
expect_out 'usage: ./do' "no task prints the usage"
expect_out 'setup  *Install Ponytail' "no task lists each task with its summary"
expect_no_call 'plugin' "no task runs nothing"

for file in "$root"/scripts/*; do
  name=$(basename "$file")
  case "$name" in _*) continue ;; esac
  if grep -q "^  $name  *[^ ]" "$work/out"; then ok "$name has a summary"; else no "$name has a summary"; fi
done

fresh
run_do frobnicate
expect_status 2 "an unknown task exits non-zero"
expect_err 'no task called frobnicate' "an unknown task says so"
expect_err 'usage: ./do' "an unknown task prints the tasks"
expect_no_call 'plugin' "an unknown task runs nothing"

# A copy of ./do, so the private script is never written into the repo.
mkdir -p "$work/copy/scripts"
cp "$root/do" "$work/copy/do"
printf '#!/bin/sh\n# Private.\necho ran\n' >"$work/copy/scripts/_probe"
chmod +x "$work/copy/scripts/_probe"
status=0
"$work/copy/do" _probe >"$work/out" 2>"$work/err" || status=$?
expect_status 2 "a private script is not a task"
if grep -q ran "$work/out"; then no "a private script does not run"; else ok "a private script does not run"; fi

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
PATH="$work/nowhere:/usr/bin:/bin" "$root/do" setup >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "setup fails when omp is not on PATH"
expect_err 'omp is not on your PATH' "setup says what is missing"
expect_err 'run ./do setup again' "setup says how to retry"

# --- lessons: every entry is checked, the window boundary holds, and a lookup
# that fails is not an entry that is current

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
first=$(git -C "$lesson_repo" rev-list --max-parents=0 main)
tip=$(git -C "$lesson_repo" rev-parse main)
printf 'merged:%s\nmerged:%s\nopen:\nfail:\nclosed:\n' "$first" "$tip" >"$work/gh-answers"
cat >"$work/bin/gh" <<'STUB'
#!/bin/sh
if [ "$1 $2" = "pr view" ]; then
  line=$(sed -n "${3}p" "$GH_ANSWERS")
  case "$line" in
  merged:*) printf 'MERGED %s\n' "${line#merged:}" ;;
  open:*) printf 'OPEN \n' ;;
  closed:*) printf 'CLOSED \n' ;;
  esac
  case "$line" in
  fail:* | '') exit 1 ;;
  esac
fi
STUB
chmod +x "$work/bin/gh"
GH_ANSWERS="$work/gh-answers"
export GH_ANSWERS

lessons_file() { # $1 name, then the rows
  name=$1
  shift
  {
    printf '| Lesson | Found in | Tripwire |\n| --- | --- | --- |\n'
    for row in "$@"; do printf '%s\n' "$row"; done
  } >"$lesson_repo/docs/$name"
}

lessons_run() { # $1 window, $2 file
  status=0
  (cd "$lesson_repo" && LESSON_WINDOW="$1" "$root/do" lessons "$2") >"$work/out" 2>"$work/err" || status=$?
}

lessons_file multi.md '| An old one | [#1](u), [#2](u) | none |'
lessons_run 1 docs/multi.md
expect_status 1 "lessons exits non-zero with an entry past the window"
if grep -q '^drop:.*#1' "$work/out"; then ok "lessons checks every entry of a row"; else no "lessons checks every entry of a row"; fi
if grep -q '#2' "$work/out"; then no "lessons leaves the entry inside the window"; else ok "lessons leaves the entry inside the window"; fi

lessons_run 2 docs/multi.md
expect_status 0 "a window equal to an entry's age does not drop it"

lessons_file broken.md '| A missing one | [#4](u) | none |'
lessons_run 50 docs/broken.md
expect_status 1 "a lookup that fails exits non-zero"
if grep -q 'nothing past the window' "$work/out"; then no "a failed lookup does not read as a clean index"; else ok "a failed lookup does not read as a clean index"; fi
if grep -q '#4' "$work/err"; then ok "a failed lookup names the entry"; else no "a failed lookup names the entry"; fi

lessons_file closed.md '| An abandoned one | [#5](u) | none |'
lessons_run 50 docs/closed.md
expect_status 1 "an entry closed without merging is dropped"
if grep -q 'closed without merging' "$work/out"; then ok "an entry closed without merging says so"; else no "an entry closed without merging says so"; fi

lessons_file urlform.md '| A url-only one | [the old one](https://example.test/pull/1) | none |'
lessons_run 1 docs/urlform.md
expect_status 1 "an entry whose text is not #N is still checked"
if grep -q '^drop:.*#1' "$work/out"; then ok "the number is read from the link's url"; else no "the number is read from the link's url"; fi

lessons_file unreadable.md '| A link with no number | [the tracker](https://example.test/issues) | none |'
lessons_run 50 docs/unreadable.md
expect_status 1 "an entry that names no pull request exits non-zero"
if grep -q 'names no pull request' "$work/err"; then ok "an entry that names no pull request says so"; else no "an entry that names no pull request says so"; fi
if grep -q 'nothing past the window' "$work/out"; then no "an unreadable entry does not read as a clean index"; else ok "an unreadable entry does not read as a clean index"; fi

lessons_file clean.md '| A fresh one | [#2](u) | none |' '| An open one | [#3](u) | none |'
lessons_run 50 docs/clean.md
expect_status 0 "lessons exits zero when nothing is past the window"
if grep -q 'nothing past the window' "$work/out"; then ok "lessons says nothing is past the window"; else no "lessons says nothing is past the window"; fi

lessons_run abc docs/clean.md
expect_status 1 "a window that is not a number exits non-zero"
if grep -q 'must be a number' "$work/err"; then ok "a window that is not a number says what it wants"; else no "a window that is not a number says what it wants"; fi
if grep -q 'nothing past the window' "$work/out"; then no "a broken window does not read as a clean index"; else ok "a broken window does not read as a clean index"; fi

printf '\n%d failed\n' "$failures"
[ "$failures" -eq 0 ]
