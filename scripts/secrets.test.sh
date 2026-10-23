#!/bin/sh

# Tests for ./do secrets: the scan and the pre-commit hook, with the real scanner.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

# The secrets task and the hook, with the real scanner: a credential is named
# and refused, and a file without one passes.
secrets_repo="$work/secrets-repo"
mkdir -p "$secrets_repo/node_modules/.bin"
cp "$root/do" "$secrets_repo/do"
cp -R "$root/scripts" "$secrets_repo/scripts"
for task in check check-docs check-links check-names; do
  printf '#!/bin/sh\nexit 0\n' >"$secrets_repo/scripts/$task"
done
cp "$root/.secretlintrc.json" "$secrets_repo/"
ln -s "$root/node_modules/.bin/secretlint" "$secrets_repo/node_modules/.bin/secretlint"
printf '#!/bin/sh\nexit 0\n' >"$secrets_repo/node_modules/.bin/vp"
chmod +x "$secrets_repo/node_modules/.bin/vp"
(
  cd "$secrets_repo" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
)
run_secrets() {
  status=0
  (cd "$secrets_repo" && "$secrets_repo/do" "$@") >"$work/out" 2>"$work/err" || status=$?
}

# Built from parts, so this file holds no credential for the project scan to find.
token="ghp_$(printf '%s' 16C7e42F292c6912E708e4CdE8D9e5F0A1b2)"
printf 'GH_TOKEN=%s\n' "$token" >"$secrets_repo/leaked.txt"

run_secrets secrets
expect_status 1 "the secrets task refuses a credential"
expect_out 'leaked.txt' "the secrets task names the file"
expect_out 'GITHUB_TOKEN' "the secrets task names the rule"

git -C "$secrets_repo" add leaked.txt
run_secrets precommit
expect_status 1 "a staged credential is refused"
expect_out 'leaked.txt' "the refused commit names the file"

git -C "$secrets_repo" rm -q --cached leaked.txt
rm "$secrets_repo/leaked.txt"
printf 'nothing to hide\n' >"$secrets_repo/plain.txt"
git -C "$secrets_repo" add plain.txt
run_secrets precommit
expect_status 0 "a staged file with no credential passes"
run_secrets secrets
expect_status 0 "the secrets task passes with no credential"

# The commit holds the staged copy, which the working tree may no longer match.
printf 'GH_TOKEN=%s\n' "$token" >"$secrets_repo/partial.txt"
git -C "$secrets_repo" add partial.txt
printf 'nothing here\n' >"$secrets_repo/partial.txt"
run_secrets precommit
expect_status 1 "a credential left in the index is refused"
expect_out 'partial.txt' "the partly staged file is named"

# A rename carries the file's content to a new path, which the diff reports as R.
for i in $(seq 1 20); do printf 'line %s of a file long enough to stay a rename\n' "$i" >>"$secrets_repo/plain.txt"; done
git -C "$secrets_repo" add -A
git -C "$secrets_repo" commit -qm base
git -C "$secrets_repo" mv plain.txt moved.txt
printf 'GH_TOKEN=%s\n' "$token" >>"$secrets_repo/moved.txt"
git -C "$secrets_repo" add -A
run_secrets precommit
expect_status 1 "a rename that carries a credential is refused"
expect_out 'moved.txt' "the renamed file is named"

# Every hit is named, not only the first.
printf 'GH_TOKEN=%s\n' "$token" >"$secrets_repo/one.txt"
printf 'GH_TOKEN=%s\n' "$token" >"$secrets_repo/two.txt"
git -C "$secrets_repo" add -A
run_secrets precommit
expect_status 1 "a commit holding two credentials is refused"
expect_out 'one.txt' "the first credential is named"
expect_out 'two.txt' "the second credential is named"

# A commit with nothing left to scan, such as one that only deletes files.
git -C "$secrets_repo" reset -q
printf 'gone\n' >"$secrets_repo/gone.txt"
git -C "$secrets_repo" add gone.txt
git -C "$secrets_repo" commit -qm gone
git -C "$secrets_repo" rm -q gone.txt
run_secrets precommit
expect_status 0 "a commit that only deletes files is not refused"

finish
