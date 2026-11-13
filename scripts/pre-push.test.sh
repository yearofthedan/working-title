#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

remote="$work/remote.git"
repo="$work/repo"
git init -q --bare -b main "$remote"
mkdir -p "$repo/.vite-hooks"
cp "$root/do" "$repo/do"
cp -R "$root/scripts" "$repo/scripts"
cp -R "$root/.vite-hooks/_" "$root/.vite-hooks/pre-push" "$repo/.vite-hooks/"
(
  cd "$repo" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
  git config core.hooksPath .vite-hooks/_
  git remote add origin "$remote"
  git commit -q --allow-empty -m base
  git push -q --no-verify origin main
)

push() {
  status=0
  git -C "$repo" push -q origin "$@" >"$work/out" 2>"$work/err" || status=$?
}
commit() { git -C "$repo" commit -q --allow-empty -m "$1"; }

git -C "$repo" switch -q -c 76-a-story
commit 'one'
push 76-a-story
expect_status 0 "a new story branch is pushed"

commit 'two'
push 76-a-story
expect_status 0 "a story branch that moves forward is pushed"

push HEAD:main
expect_status 1 "a push to main is refused"
expect_err 'refs/heads/main is not a story branch' "the refusal names the branch"

git -C "$repo" switch -q -c a-story-without-a-number
push a-story-without-a-number
expect_status 1 "a branch without an issue number is refused"

git -C "$repo" switch -q 76-a-story
git -C "$repo" tag v1
push v1
expect_status 1 "a tag is refused"

git -C "$repo" reset -q --hard HEAD~1
commit 'two, rewritten'
push --force 76-a-story
expect_status 1 "a push that rewrites the story branch is refused"
expect_err 'would rewrite 76-a-story' "the refusal says it would rewrite the branch"

push --delete 76-a-story
expect_status 1 "a push that deletes a branch is refused"
expect_err 'deletes refs/heads/76-a-story' "the refusal says it deletes the ref"

finish
