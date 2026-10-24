#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

cat >"$work/audit.json" <<'JSON'
{"advisories":{"1106913":{"title":"Command Injection in lodash","module_name":"lodash","severity":"high","github_advisory_id":"GHSA-35jh-r3h4-6jhm","url":"https://github.com/advisories/GHSA-35jh-r3h4-6jhm","findings":[{"version":"4.17.20","paths":[".>lodash"]}]}}}
JSON
PNPM_AUDIT_JSON="$work/audit.json"
export PNPM_AUDIT_JSON
make_copy

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

finish
