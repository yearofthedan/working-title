#!/bin/sh

# Tests for ./do precommit: it hands the staged files to vp staged, then runs the
# checks the staged change needs. Its credential scan is in secrets.test.sh.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy

for task in check check-docs check-links check-names; do
  printf '#!/bin/sh\necho "ran %s" >> "$VP_LOG"\nexit "${%s:-0}"\n' "$task" "$(printf '%s' "$task" | tr a-z- A-Z_)_EXIT" >"$copy/scripts/$task"
  chmod +x "$copy/scripts/$task"
done

stage() {
  (
    cd "$copy" || exit 1
    git reset -q --hard
    for path in "$@"; do
      mkdir -p "$(dirname "$path")"
      echo change >"$path"
      git add -- "$path"
    done
  )
}

precommit() {
  status=0
  : >"$VP_LOG"
  (cd "$copy" && "$copy/do" precommit) >"$work/out" 2>"$work/err" || status=$?
}

ran() { if grep -qx "ran $1" "$VP_LOG"; then ok "$2"; else no "$2"; fi; }
not_ran() { if grep -qx "ran $1" "$VP_LOG"; then no "$2"; else ok "$2"; fi; }

stage src/domain/project.ts
precommit
expect_vp 'staged' "precommit runs vp staged"
ran check "a change to code runs ./do check"
expect_status 0 "a change to code that passes the check commits"

stage docs/standards/markup.md README.md .agents/skills/implement/SKILL.md
precommit
ran check-docs "a change to docs alone runs the docs check"
ran check-links "a change to docs alone runs the link check"
ran check-names "a change to docs alone runs the names check"
not_ran check "a change to docs alone skips the full check"

stage docs/standards/markup.md src/domain/project.ts
precommit
ran check "docs with code runs ./do check"

stage src/ui/focus/scenarios/focus-interactions.approved.md
precommit
ran check "a scenario file under src/ runs ./do check"

stage e2e/the-story-starts-with-five-beats.approved.md
precommit
ran check "a scenario file under e2e/ runs ./do check"

stage
precommit
ran check "a commit with nothing staged runs ./do check"

(
  cd "$copy" || exit 1
  git reset -q --hard
  git rm -q package.json
)
precommit
ran check "a deleted file runs ./do check"

stage src/domain/project.ts
CHECK_EXIT=1
export CHECK_EXIT
precommit
unset CHECK_EXIT
if [ "$status" -ne 0 ]; then ok "a failing check refuses the commit"; else no "a failing check refuses the commit"; fi

stage docs/standards/markup.md
CHECK_DOCS_EXIT=1
export CHECK_DOCS_EXIT
precommit
unset CHECK_DOCS_EXIT
if [ "$status" -ne 0 ]; then ok "a failing docs check refuses a docs commit"; else no "a failing docs check refuses a docs commit"; fi

cp "$copy/scripts/check" "$work/check-stand-in"
printf '#!/bin/sh\necho "index=${GIT_INDEX_FILE:-} dir=${GIT_DIR:-}" >> "$VP_LOG"\n' >"$copy/scripts/check"
stage src/domain/project.ts
status=0
: >"$VP_LOG"
(cd "$copy" && GIT_INDEX_FILE="$copy/.git/index" GIT_DIR="$copy/.git" "$copy/do" precommit) >"$work/out" 2>"$work/err" || status=$?
expect_vp 'index= dir=' "the checks run without the repository git hands a hook"
cp "$work/check-stand-in" "$copy/scripts/check"

finish
