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

GH_PRS="$work/gh-prs"
export GH_PRS
: >"$GH_PRS"
printf '#!/bin/sh\n' >"$work/bin/gh"
cat >>"$work/bin/gh" <<'STUB'
[ -e "$GH_PRS" ] || { echo 'HTTP 401: Bad credentials' >&2; exit 1; }
cat "$GH_PRS"
STUB
chmod +x "$work/bin/gh"

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
expect_err 'no open pull request carries 76-a-story; open one' "a branch with no pull request yet is told to open one"

echo 'open #77' >"$GH_PRS"
commit 'three'
push 76-a-story
expect_status 0 "a branch with an open pull request is pushed"
if [ -s "$work/err" ]; then no "a branch with an open pull request gets no note"; else ok "a branch with an open pull request gets no note"; fi

echo 'merged #216' >"$GH_PRS"
commit 'four'
push 76-a-story
expect_status 0 "a branch whose pull request merged is still pushed"
expect_err 'no open pull request carries 76-a-story (merged #216); open one' "the note names the merged pull request"

rm "$GH_PRS"
commit 'five'
push 76-a-story
expect_status 0 "a push goes through when gh cannot read the pull requests"
expect_err 'gh could not read its pull requests' "the note says gh could not read them"
: >"$GH_PRS"

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
