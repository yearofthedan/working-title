#!/bin/sh

# Tests for ./do setup: installing Ponytail into OMP, with a stub omp that records its calls.

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

cat >"$work/bin/omp" <<'STUB'
#!/bin/sh
echo "$*" >> "$OMP_LOG"
if [ "$1 $2" = "plugin list" ]; then cat "$OMP_LIST"; fi
if [ "$1 $2" = "plugin marketplace" ] && [ "$3" = "list" ]; then cat "$OMP_MARKETPLACES"; fi
STUB
chmod +x "$work/bin/omp"
OMP_LOG="$work/calls"
OMP_LIST="$work/plugins.json"
OMP_MARKETPLACES="$work/marketplaces"
export OMP_LOG OMP_LIST OMP_MARKETPLACES

# A machine with no marketplaces configured and nothing installed.
fresh() {
  printf '{"npm":[],"marketplace":[]}' >"$OMP_LIST"
  : >"$OMP_MARKETPLACES"
  : >"$OMP_LOG"
}
expect_call() { if grep -q "$1" "$OMP_LOG"; then ok "$2"; else no "$2"; fi; }
expect_no_call() { if grep -q "$1" "$OMP_LOG"; then no "$2"; else ok "$2"; fi; }

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

finish
