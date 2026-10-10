#!/bin/sh

set -eu

root=$(cd "$(dirname "$0")" && pwd)
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
  if [ -x "$file" ]; then ok "$name is executable"; else no "$name is executable"; continue; fi
  if grep -q "^  $name  *[^ ]" "$work/out"; then ok "$name has a summary"; else no "$name has a summary"; fi
done

fresh
run_do frobnicate
expect_status 2 "an unknown task exits non-zero"
expect_err 'no task called frobnicate' "an unknown task says so"
expect_err 'usage: ./do' "an unknown task prints the tasks"
expect_no_call 'plugin' "an unknown task runs nothing"

# A copy of ./do and its tasks, with a stub vp that records its calls, so
# nothing is written into the repo and no real check runs.
copy="$work/copy"
mkdir -p "$copy/node_modules/.bin"
cp "$root/do" "$copy/do"
cp -R "$root/scripts" "$copy/scripts"
cp "$root/.secretlintrc.json" "$copy/"
printf '#!/bin/sh\n# Private.\necho ran\n' >"$copy/scripts/_probe"
chmod +x "$copy/scripts/_probe"
cat >"$copy/node_modules/.bin/vp" <<'STUB'
#!/bin/sh
echo "$*" >> "$VP_LOG"
STUB
chmod +x "$copy/node_modules/.bin/vp"
printf '#!/bin/sh\necho "playwright $*" >> "$VP_LOG"\n' >"$copy/node_modules/.bin/playwright"
chmod +x "$copy/node_modules/.bin/playwright"
printf '#!/bin/sh\necho "secretlint $*" >> "$VP_LOG"\n' >"$copy/node_modules/.bin/secretlint"
chmod +x "$copy/node_modules/.bin/secretlint"
printf '#!/bin/sh\necho "pnpm $*" >> "$VP_LOG"\ncase "$*" in "audit --json") if [ -z "${PNPM_AUDIT_SILENT:-}" ]; then if grep -q vulnerable-fixture pnpm-lock.yaml 2>/dev/null; then cat "$PNPM_AUDIT_JSON"; else printf %s "{\\"advisories\\":{}}"; fi; fi;; esac\n' >"$copy/node_modules/.bin/pnpm"
chmod +x "$copy/node_modules/.bin/pnpm"
cp "$root/package.json" "$root/pnpm-workspace.yaml" "$root/pnpm-lock.yaml" "$copy/"
cat >"$work/audit.json" <<'JSON'
{"advisories":{"1106913":{"title":"Command Injection in lodash","module_name":"lodash","severity":"high","github_advisory_id":"GHSA-35jh-r3h4-6jhm","url":"https://github.com/advisories/GHSA-35jh-r3h4-6jhm","findings":[{"version":"4.17.20","paths":[".>lodash"]}]}}}
JSON
PNPM_AUDIT_JSON="$work/audit.json"
export PNPM_AUDIT_JSON
(
  cd "$copy" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
  git add package.json pnpm-workspace.yaml pnpm-lock.yaml
  git commit -qm base
  git update-ref refs/remotes/origin/main HEAD
)
VP_LOG="$work/vp-calls"
export VP_LOG
run_copy() {
  status=0
  : >"$VP_LOG"
  "$copy/do" "$@" >"$work/out" 2>"$work/err" || status=$?
}
expect_vp() { if grep -qx "$1" "$VP_LOG"; then ok "$2"; else no "$2"; fi; }
expect_vp_literal() { if grep -Fqx "$1" "$VP_LOG"; then ok "$2"; else no "$2"; fi; }

printf '#!/bin/sh\necho ran\n' >"$copy/outside"
chmod +x "$copy/outside"
run_copy ../outside
expect_status 2 "a path is not a task"
if grep -q ran "$work/out"; then no "a path outside scripts/ does not run"; else ok "a path outside scripts/ does not run"; fi

run_copy _probe
expect_status 2 "a private script is not a task"
if grep -q ran "$work/out"; then no "a private script does not run"; else ok "a private script does not run"; fi

run_copy
if grep -q '_probe' "$work/out"; then no "a private script is not listed"; else ok "a private script is not listed"; fi

run_copy check
expect_status 0 "check succeeds when vp does"
expect_vp 'check' "check runs vp check from node_modules"
expect_vp_literal 'secretlint **/*' "check scans the project for secrets"
expect_vp 'pnpm audit --json' "check audits the lockfile"
if [ "$(grep -c '^pnpm audit --json$' "$VP_LOG")" = 2 ]; then ok "check audits the head and the base"; else no "check audits the head and the base"; fi
expect_vp 'test' "check runs the tests"
expect_vp 'playwright test' "check runs the browser specs"

run_copy approve
expect_status 2 "approve without a test refuses"
expect_err 'Name the test file to approve' "approve without a test says what it needs"

run_copy approve -t thing
expect_status 2 "approve without a test file first refuses"

: >"$copy/thing.test.ts"
run_copy approve "$copy/thing.test.ts"
expect_vp "test --update=all $copy/thing.test.ts" "approve updates only the test file named"

for flag in -u --update --update=all; do
  run_copy test "$flag"
  expect_status 2 "test refuses $flag"
done
expect_err 'never write approved files' "test says it does not write approved files"
expect_err 'Verify the intent of the update' "test asks for the intent of the update to be verified"

run_copy precommit
expect_vp 'staged' "precommit runs vp staged"

run_copy preview
expect_vp 'build' "preview builds the app"
expect_vp 'preview' "preview serves the build"

# Without the stub, and with a PATH that holds no vp of its own.
rm "$copy/node_modules/.bin/vp"
status=0
PATH=/usr/bin:/bin "$copy/do" test >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "a task that needs vp fails without it"
expect_err 'Run pnpm install' "a task that needs vp says how to get it"

fresh
run_do setup
expect_status 0 "setup succeeds on a fresh machine"
expect_call 'plugin marketplace add DietrichGebert/ponytail' "setup adds the marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"
expect_out 'Installed Ponytail' "setup says it installed Ponytail"

printf '{"npm":[],"marketplace":[{"id":"ponytail@ponytail","scope":"user"}]}' >"$OMP_LIST"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when Ponytail is installed"
expect_out 'already installed' "setup says Ponytail is already installed"
expect_no_call 'marketplace add' "setup does not re-add the marketplace"
expect_no_call 'plugin install' "setup re-installs nothing"

printf '{"npm":[],"marketplace":[]}' >"$OMP_LIST"
printf 'ponytail  DietrichGebert/ponytail\n' >"$OMP_MARKETPLACES"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when the marketplace is already configured"
expect_no_call 'marketplace add' "setup does not re-add the marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"

# A PATH holding only what ./do itself needs, so omp is missing wherever this runs.
mkdir -p "$work/nowhere"
ln -s "$(command -v dirname)" "$work/nowhere/dirname"
status=0
PATH="$work/nowhere" "$root/do" setup >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "setup fails when omp is not on PATH"
expect_err 'omp is not on your PATH' "setup says what is missing"
expect_err 'run ./do setup again' "setup says how to retry"

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

# The secrets task and the hook, with the real scanner: a credential is named
# and refused, and a file without one passes.
secrets_repo="$work/secrets-repo"
mkdir -p "$secrets_repo/node_modules/.bin"
cp "$root/do" "$secrets_repo/do"
cp -R "$root/scripts" "$secrets_repo/scripts"
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
# What counts as new: the same advisory at the same version under a new path is
# not, and the same path at a new version is.
advisory() { # $1 version, $2 path
  printf '{"advisories":{"1106913":{"title":"Command Injection in lodash","module_name":"lodash","severity":"high","github_advisory_id":"GHSA-35jh-r3h4-6jhm","url":"u","findings":[{"version":"%s","dev":true,"paths":["%s"]}]}}}' "$1" "$2"
}
advisory 4.17.20 '.>lodash' >"$work/audit-a.json"
advisory 4.17.20 '.>foo>lodash' >"$work/audit-b.json"
advisory 4.17.21 '.>lodash' >"$work/audit-c.json"

status=0
node "$root/scripts/_audit.mjs" "$work/audit-a.json" "$work/audit-b.json" origin/main >"$work/out" 2>"$work/err" || status=$?
expect_status 0 "a dependency reached by a new path is not refused"
expect_out 'already in origin/main' "a dependency reached by a new path says so"

status=0
node "$root/scripts/_audit.mjs" "$work/audit-c.json" "$work/audit-a.json" origin/main >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "a version the base does not carry is refused"
expect_err 'added by this change' "a version the base does not carry says so"

# The audit refuses only what the change adds, and a service that does not answer
# is refused in CI but only warned about on a builder's machine.
printf 'vulnerable-fixture@1.0.0\n' >>"$copy/pnpm-lock.yaml"
run_audit() {
  status=0
  : >"$VP_LOG"
  (cd "$copy" && "$copy/do" audit) >"$work/out" 2>"$work/err" || status=$?
}
run_audit
expect_status 1 "an advisory the change adds is refused"
expect_err 'GHSA-35jh-r3h4-6jhm' "an advisory the change adds is named"
expect_err 'added by this change' "an advisory the change adds says so"

(
  cd "$copy" || exit 1
  git add pnpm-lock.yaml
  git commit -qm head
  git update-ref refs/remotes/origin/main HEAD
)
run_audit
expect_status 0 "an advisory the base already carries is not refused"
expect_out 'already in origin/main' "an advisory the base already carries says so"

silent() {
  status=0
  : >"$VP_LOG"
  (cd "$copy" && env "$@" PNPM_AUDIT_SILENT=1 "$copy/do" audit) >"$work/out" 2>"$work/err" || status=$?
}
silent -u CI
expect_status 0 "an unreachable advisory service warns on a builder's machine"
expect_err 'could not be reached' "the warning says what could not be reached"
silent CI=true
expect_status 1 "an unreachable advisory service fails in CI"
expect_err 'could not be reached' "the CI failure says what could not be reached"

printf '\n%d failed\n' "$failures"
[ "$failures" -eq 0 ]
