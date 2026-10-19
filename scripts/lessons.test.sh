#!/bin/sh

# Tests for ./do lessons: every entry is checked, the window boundary holds, and a
# lookup that fails is not an entry that is current; with a stub gh.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

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
# Answers the one call ./do lessons makes: a single `pr list`, one line per number,
# `N STATE SHA`, as the `-q` filter prints it. Line N of GH_ANSWERS is pull request N,
# and a `fail:` line is left out of the list.
case "$1 $2" in
'pr list')
  [ -n "${GH_LIST_FAIL:-}" ] && exit 1
  n=0
  while IFS= read -r line; do
    n=$((n + 1))
    case "$line" in
    merged:*) printf '%s MERGED %s\n' "$n" "${line#merged:}" ;;
    open:*) printf '%s OPEN \n' "$n" ;;
    closed:*) printf '%s CLOSED \n' "$n" ;;
    esac
  done <"$GH_ANSWERS"
  ;;
*)
  printf 'gh %s is not the call this stub stands for\n' "$*" >&2
  exit 1
  ;;
esac
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

export GH_LIST_FAIL=1
lessons_run 50 docs/clean.md
unset GH_LIST_FAIL
expect_status 1 "a gh pr list that fails exits non-zero"
if grep -q 'gh pr list' "$work/err"; then ok "a failed gh pr list is named"; else no "a failed gh pr list is named"; fi
if grep -q 'nothing past the window' "$work/out"; then no "a failed list does not read as a clean index"; else ok "a failed list does not read as a clean index"; fi

finish
