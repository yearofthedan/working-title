#!/bin/sh

# Tests for ./do, with a stub omp that records what it is asked to do.
# Run: sh tests/do.test.sh

set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
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

expect_status() { if [ "$status" -eq "$1" ]; then ok "$2"; else no "$2 (exit $status)"; fi; }
expect_err() { if grep -q "$1" "$work/err"; then ok "$2"; else no "$2"; fi; }
expect_call() { if grep -q "$1" "$OMP_LOG"; then ok "$2"; else no "$2"; fi; }
expect_no_call() { if grep -q "$1" "$OMP_LOG"; then no "$2"; else ok "$2"; fi; }

fresh
run_do
expect_status 2 "no task exits non-zero"
expect_err 'usage: ./do' "no task prints the tasks"
expect_no_call 'plugin' "no task runs nothing"

fresh
run_do frobnicate
expect_status 2 "an unknown task exits non-zero"
expect_err 'usage: ./do' "an unknown task prints the tasks"
expect_no_call 'plugin' "an unknown task runs nothing"

fresh
run_do setup
expect_status 0 "setup succeeds on a fresh machine"
expect_call 'plugin marketplace add DietrichGebert/ponytail' "setup adds the marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"

printf '{"npm":[],"marketplace":[{"id":"ponytail@ponytail","scope":"user"}]}' >"$OMP_LIST"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when Ponytail is installed"
expect_no_call 'marketplace add' "setup does not re-add the marketplace"
expect_no_call 'plugin install' "setup re-installs nothing"

printf '{"npm":[],"marketplace":[]}' >"$OMP_LIST"
printf 'ponytail  DietrichGebert/ponytail\n' >"$OMP_MARKETPLACES"
: >"$OMP_LOG"
run_do setup
expect_status 0 "setup succeeds when the marketplace is already configured"
expect_no_call 'marketplace add' "setup does not re-add the marketplace"
expect_call 'plugin install ponytail@ponytail' "setup installs Ponytail"

printf '\n%d failed\n' "$failures"
[ "$failures" -eq 0 ]
