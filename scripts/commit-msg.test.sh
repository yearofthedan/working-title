#!/bin/sh

# Tests for ./do commit-msg, through the commit-msg hook and real git commits.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

repo="$work/repo"
mkdir -p "$repo"
cp "$root/do" "$repo/do"
cp -R "$root/scripts" "$repo/scripts"
# The commit-msg hook alone, behind the wrapper vp config installs, so the
# pre-commit checks stay out of these commits.
mkdir -p "$repo/.vite-hooks"
cp -R "$root/.vite-hooks/_" "$root/.vite-hooks/commit-msg" "$repo/.vite-hooks/"
(
  cd "$repo" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
  git config core.hooksPath .vite-hooks/_
  git commit -q --allow-empty -m base --no-verify
)

commit() {
  status=0
  git -C "$repo" commit --allow-empty "$@" >"$work/out" 2>"$work/err" || status=$?
}

git -C "$repo" switch -q -c 76-a-story

commit -m '76: Change'
expect_status 1 "a story-branch commit without the trailer is refused"
expect_err 'Agent-Model:' "the refusal names the trailer"

commit -m '76: Change' --trailer 'Agent-Model: '
expect_status 1 "a story-branch commit with an empty trailer is refused"

commit -m '76: Change' --trailer 'Agent-Model: anthropic/claude-opus-5-5'
expect_status 0 "a story-branch commit with the trailer is accepted"

# A Markdown rule in the body is a line git can read as the start of a patch.
commit -m '76: Change' -m "$(printf 'Above\n---\nBelow')" --trailer 'Agent-Model: anthropic/claude-opus-5-5'
expect_status 0 "a trailer below a --- line in the body is accepted"

commit -m 'Merge the lists'
expect_status 1 "a commit titled Merge that is not a merge is refused"

status=0
DISABLE_MODEL_CHECK=1 git -C "$repo" commit --allow-empty -m '76: By hand' >"$work/out" 2>"$work/err" || status=$?
expect_status 0 "DISABLE_MODEL_CHECK=1 lets a commit through without the trailer"

git -C "$repo" switch -q main
commit -m 'Change'
expect_status 0 "a commit off a story branch passes without the trailer"

# A merge brings in commits already written, and git runs commit-msg for it too.
git -C "$repo" commit -q --allow-empty -m 'On main' --no-verify
git -C "$repo" switch -q 76-a-story
status=0
git -C "$repo" merge --no-ff -q main >"$work/out" 2>"$work/err" || status=$?
expect_status 0 "a merge into a story branch passes without the trailer"

git -C "$repo" switch -q main
git -C "$repo" commit -q --allow-empty -m 'Again on main' --no-verify
git -C "$repo" switch -q 76-a-story
status=0
git -C "$repo" merge --no-ff -q -m '76: Bring in main' main >"$work/out" 2>"$work/err" || status=$?
expect_status 0 "a merge with its own message passes without the trailer"

finish
