#!/bin/sh

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

run_add() {
  status=0
  : >"$VP_LOG"
  (cd "$copy" && env "$@" "$copy/do" add -D vulnerable-fixture) >"$work/out" 2>"$work/err" || status=$?
}
unchanged() {
  snapshot >"$work/now"
  if cmp -s "$work/before" "$work/now"; then ok "$1"; else no "$1"; fi
}
install_line() { grep -n 'pnpm install --frozen-lockfile' "$VP_LOG" | head -n 1 | cut -d: -f 1; }

before
chmod 444 "$copy/pnpm-workspace.yaml"
run_add PNPM_ADD_CLEAN=1
expect_status 1 "a copy-back that fails partway is refused"
expect_err 'could not be written' "the refusal says the audited files could not be written"
expect_err 'may not hold what was there' "the file that would not go back says so"
expect_err 'what was there is kept in' "the refusal says where the originals are kept"
unchanged "a copy-back that fails partway leaves the files as they were"
chmod 644 "$copy/pnpm-workspace.yaml"

before
run_add
expect_status 1 "an advisory the add brings in is refused"
expect_err 'GHSA-35jh-r3h4-6jhm' "the refusal names the advisory"
expect_err 'added by this change' "the refusal says the add brought it in"
expect_err 'Nothing was changed' "the refusal says nothing was changed"
unchanged "the add leaves the files as they were"
if [ -z "$(install_line)" ]; then ok "the add installs nothing when it is refused"; else no "the add installs nothing when it is refused"; fi

before
run_add PNPM_ADD_CLEAN=1 PNPM_INSTALL_FAIL=1
expect_status 1 "an install that fails after a clean audit is refused"
expect_err 'could not be installed' "the refusal says what could not be installed"
expect_err 'Nothing was changed' "the refusal says the add was undone"
unchanged "a failed install leaves the files as they were"
if [ "$(grep -c 'pnpm install --frozen-lockfile' "$VP_LOG")" -eq 2 ]; then ok "the restored lockfile is installed again"; else no "the restored lockfile is installed again"; fi
if [ "$(grep -c 'install failed' "$VP_LOG")" -eq 1 ]; then ok "the restored lockfile installs, rather than failing as the first one did"; else no "the restored lockfile installs, rather than failing as the first one did"; fi

before
run_add PNPM_ADD_CLEAN=1 PNPM_INSTALL_FAIL_ALWAYS=1
expect_status 1 "an install that fails both times is refused"
expect_err 'node_modules may not match' "the refusal says node_modules may not match the files"
unchanged "an install that fails both times leaves the files as they were"

if grep -q '^# added' "$copy/package.json" "$copy/pnpm-lock.yaml" "$copy/pnpm-workspace.yaml"; then
  no "the copy holds nothing the cases before left behind"
else
  ok "the copy holds nothing the cases before left behind"
fi
run_add PNPM_ADD_CLEAN=1
expect_status 0 "an add with no advisory is allowed"
for file in $files; do
  if [ "$(tail -n 1 "$copy/$file")" = '# added' ]; then ok "$file is the one that was audited"; else no "$file is the one that was audited"; fi
done
expect_vp_literal 'pnpm install --frozen-lockfile' "the audited lockfile is installed"
if [ -n "$(install_line)" ] && [ "$(install_line)" -gt "$(grep -n 'pnpm audit --json' "$VP_LOG" | tail -n 1 | cut -d: -f 1)" ]; then
  ok "the install comes after the audit"
else
  no "the install comes after the audit"
fi

before
run_add PNPM_AUDIT_SILENT=1
expect_err 'could not be reached' "an unreachable advisory service is refused, naming what could not be reached"
unchanged "an unreachable advisory service leaves the files as they were"
if [ -z "$(install_line)" ]; then ok "an unreachable advisory service installs nothing"; else no "an unreachable advisory service installs nothing"; fi

run_add PNPM_AUDIT_SILENT=1 CI=true
expect_err 'could not be reached' "an unreachable advisory service in CI is refused the same way"
unchanged "an unreachable advisory service in CI leaves the files as they were"

finish
