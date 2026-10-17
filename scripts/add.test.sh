#!/bin/sh

# Tests for ./do add: an advisory the add brings in is refused before anything of
# the dependency is installed, and a clean add installs exactly what was audited.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

cat >"$work/audit.json" <<'JSON'
{"advisories":{"1106913":{"title":"Command Injection in lodash","module_name":"lodash","severity":"high","github_advisory_id":"GHSA-35jh-r3h4-6jhm","url":"https://github.com/advisories/GHSA-35jh-r3h4-6jhm","findings":[{"version":"4.17.20","dev":true,"paths":[".>vulnerable-fixture>lodash"]}]}}}
JSON
PNPM_AUDIT_JSON="$work/audit.json"
export PNPM_AUDIT_JSON
make_copy

files='package.json pnpm-lock.yaml pnpm-workspace.yaml'
snapshot() {
  for file in $files; do cksum "$copy/$file"; done
}
before() { snapshot >"$work/before"; }

run_add() { # $@ environment assignments, as in `run_add PNPM_ADD_CLEAN=1`
  status=0
  : >"$VP_LOG"
  (cd "$copy" && env "$@" "$copy/do" add -D vulnerable-fixture) >"$work/out" 2>"$work/err" || status=$?
}
unchanged() {
  snapshot >"$work/now"
  if cmp -s "$work/before" "$work/now"; then ok "$1"; else no "$1"; fi
}
install_line() { grep -n 'pnpm install --frozen-lockfile' "$VP_LOG" | head -n 1 | cut -d: -f 1; }

# An advisory the add brings in stops it, and the refusal names the advisory. The
# add is resolved in a scratch copy, so the repo's own files are never written.
before
run_add
expect_status 1 "an advisory the add brings in is refused"
expect_err 'GHSA-35jh-r3h4-6jhm' "the refusal names the advisory"
expect_err 'added by this change' "the refusal says the add brought it in"
expect_err 'Nothing was changed' "the refusal says nothing was changed"
unchanged "the add leaves the files as they were"
if [ -z "$(install_line)" ]; then ok "the add installs nothing when it is refused"; else no "the add installs nothing when it is refused"; fi

# With no advisory, what was audited is what is installed, and the install comes
# after the audit: the check is not told about a lockfile already in place.
run_add PNPM_ADD_CLEAN=1
expect_status 0 "an add with no advisory is allowed"
for file in $files; do
  if grep -q '^# added' "$copy/$file"; then ok "$file is the one that was audited"; else no "$file is the one that was audited"; fi
done
expect_vp_literal 'pnpm install --frozen-lockfile' "the audited lockfile is installed"
if [ -n "$(install_line)" ] && [ "$(install_line)" -gt "$(grep -n 'pnpm audit --json' "$VP_LOG" | tail -n 1 | cut -d: -f 1)" ]; then
  ok "the install comes after the audit"
else
  no "the install comes after the audit"
fi

# A clean audit is not enough: an install that fails partway is undone, and the
# restored lockfile is installed again so node_modules matches it.
before
run_add PNPM_ADD_CLEAN=1 PNPM_INSTALL_FAIL=1
expect_status 1 "an install that fails after a clean audit is refused"
expect_err 'could not be installed' "the refusal says what could not be installed"
unchanged "a failed install leaves the files as they were"
if [ "$(grep -c 'pnpm install --frozen-lockfile' "$VP_LOG")" -eq 2 ]; then ok "the restored lockfile is installed again"; else no "the restored lockfile is installed again"; fi

# A gate that cannot answer refuses, whether or not it is a CI run: the risk is a
# dependency reaching this machine, not a check going unrun.
before
run_add PNPM_AUDIT_SILENT=1
expect_status 1 "an unreachable advisory service is refused"
expect_err 'could not be reached' "the refusal says what could not be reached"
unchanged "an unreachable advisory service leaves the files as they were"

run_add PNPM_AUDIT_SILENT=1 CI=true
expect_status 1 "an unreachable advisory service is refused in CI too"
unchanged "an unreachable advisory service in CI leaves the files as they were"

finish
