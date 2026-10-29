#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

printf '#!/bin/sh\n' >"$work/bin/omp"
cat >>"$work/bin/omp" <<'STUB'
echo "$*" >> "$OMP_LOG"
if [ "$1 $2" = "plugin list" ]; then cat "$OMP_LIST"; fi
if [ "$1 $2" = "plugin marketplace" ] && [ "$3" = "list" ]; then cat "$OMP_MARKETPLACES"; fi
STUB
chmod +x "$work/bin/omp"
OMP_LOG="$work/calls"
OMP_LIST="$work/plugins.json"
OMP_MARKETPLACES="$work/marketplaces"
export OMP_LOG OMP_LIST OMP_MARKETPLACES

fresh() {
  printf '{"npm":[],"marketplace":[]}' >"$OMP_LIST"
  : >"$OMP_MARKETPLACES"
  : >"$OMP_LOG"
}
expect_call() { if grep -qF "$1" "$OMP_LOG"; then ok "$2"; else no "$2"; fi; }
expect_no_call() { if grep -qF "$1" "$OMP_LOG"; then no "$2"; else ok "$2"; fi; }
expect_out_times() {
  count=$(grep -cF "$2" "$work/out" || true)
  if [ "$count" -eq "$1" ]; then ok "$3"; else no "$3 (printed $count times)"; fi
}

fresh
run_do setup
expect_status 0 "setup succeeds on a fresh machine"
expect_call 'plugin marketplace add DietrichGebert/ponytail' "setup adds the Ponytail marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"
expect_call 'plugin marketplace add yearofthedan/snippets' "setup adds the snippets marketplace"
expect_call 'plugin install dev-skills@snippets' "setup installs dev-skills"
expect_out 'Installed Ponytail' "setup says it installed Ponytail"
expect_out 'Installed dev-skills' "setup says it installed dev-skills"
expect_out_times 1 'Run /reload-plugins in an open OMP session to load it.' "setup says to reload once"

printf '{"npm":[],"marketplace":[{"id":"ponytail@ponytail","scope":"user"}]}' >"$OMP_LIST"
printf '  ponytail  DietrichGebert/ponytail\n' >"$OMP_MARKETPLACES"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when Ponytail is installed and dev-skills is not"
expect_out 'Ponytail is already installed.' "setup says Ponytail is already installed"
expect_no_call 'marketplace add DietrichGebert/ponytail' "setup does not re-add the Ponytail marketplace"
expect_no_call 'plugin install ponytail@ponytail' "setup does not re-install Ponytail"
expect_call 'plugin marketplace add yearofthedan/snippets' "setup adds the snippets marketplace"
expect_call 'plugin install dev-skills@snippets' "setup installs dev-skills"

printf '{"npm":[],"marketplace":[{"id":"ponytail@ponytail","scope":"user"},{"id":"dev-skills@snippets","scope":"user"}]}' >"$OMP_LIST"
printf '  ponytail  DietrichGebert/ponytail\n  snippets  yearofthedan/snippets\n' >"$OMP_MARKETPLACES"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when both plugins are installed"
expect_out 'Ponytail is already installed.' "setup says Ponytail is already installed"
expect_out 'dev-skills is already installed.' "setup says dev-skills is already installed"
expect_no_call 'marketplace add' "setup adds no marketplace"
expect_no_call 'plugin install' "setup installs nothing"
expect_out_times 0 'Run /reload-plugins' "setup does not say to reload when it installed nothing"

printf '{"npm":[],"marketplace":[{"id":"ponytail@ponytail","scope":"user"}]}' >"$OMP_LIST"
printf '  ponytail  DietrichGebert/ponytail\n  snippets  yearofthedan/snippets\n' >"$OMP_MARKETPLACES"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when the snippets marketplace is already configured"
expect_no_call 'marketplace add' "setup does not re-add either marketplace"
expect_call 'plugin install dev-skills@snippets' "setup installs dev-skills"

printf '{"npm":[],"marketplace":[]}' >"$OMP_LIST"
printf '  ponytail  DietrichGebert/ponytail\n' >"$OMP_MARKETPLACES"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when the Ponytail marketplace is already configured"
expect_no_call 'marketplace add DietrichGebert/ponytail' "setup does not re-add the Ponytail marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"

make_copy
printf '#!/bin/sh\necho "weaver $*" >> "$OMP_LOG"\n' >"$copy/node_modules/.bin/weaver"
chmod +x "$copy/node_modules/.bin/weaver"
fresh
run_copy setup
expect_call "weaver skills install --dir $copy/.agents/skills --force" "setup installs weaver's skills into .agents/skills"

rm "$copy/node_modules/.bin/weaver"
mkdir -p "$work/tools"
for tool in dirname grep cat; do ln -s "$(command -v "$tool")" "$work/tools/$tool"; done
fresh
status=0
PATH="$work/bin:$work/tools" "$copy/do" setup >"$work/out" 2>"$work/err" || status=$?
expect_status 0 "setup succeeds when weaver is not installed"
expect_out 'weaver is not installed; skipped its skills' "setup says it skipped weaver's skills"

mkdir -p "$work/nowhere"
ln -s "$(command -v dirname)" "$work/nowhere/dirname"
status=0
PATH="$work/nowhere" "$root/do" setup >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "setup fails when omp is not on PATH"
expect_err 'omp is not on your PATH' "setup says what is missing"
expect_err 'run ./do setup again' "setup says how to retry"

finish
