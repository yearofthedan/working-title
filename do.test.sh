#!/bin/sh

root=$(cd "$(dirname "$0")" && pwd)
. "$root/scripts/_test-helpers"

run_do
expect_status 0 "no task exits zero"
expect_out 'usage: ./do' "no task prints the usage"
expect_out 'setup  *Install Ponytail' "no task lists each task with its summary"

for file in "$root"/scripts/*; do
  name=$(basename "$file")
  case "$name" in _* | *.test.sh) continue ;; esac
  if [ -x "$file" ]; then ok "$name is executable"; else no "$name is executable"; continue; fi
  if grep -q "^  $name  *[^ ]" "$work/out"; then ok "$name has a summary"; else no "$name has a summary"; fi
done

run_do frobnicate
expect_status 2 "an unknown task exits non-zero"
expect_err 'no task called frobnicate' "an unknown task says so"
expect_err 'usage: ./do' "an unknown task prints the tasks"

make_copy
printf '#!/bin/sh\n# Private.\necho ran\n' >"$copy/scripts/_probe"
printf '#!/bin/sh\n# A test.\necho ran\n' >"$copy/scripts/probe.test.sh"
chmod +x "$copy/scripts/_probe" "$copy/scripts/probe.test.sh"
printf '#!/bin/sh\necho ran\n' >"$copy/outside"
chmod +x "$copy/outside"

run_copy ../outside
expect_status 2 "a path is not a task"
if grep -q ran "$work/out"; then no "a path outside scripts/ does not run"; else ok "a path outside scripts/ does not run"; fi

run_copy _probe
expect_status 2 "a private script is not a task"
if grep -q ran "$work/out"; then no "a private script does not run"; else ok "a private script does not run"; fi

run_copy probe.test.sh
expect_status 2 "a test file is not a task"
if grep -q ran "$work/out"; then no "a test file does not run"; else ok "a test file does not run"; fi

run_copy
if grep -q '_probe' "$work/out"; then no "a private script is not listed"; else ok "a private script is not listed"; fi
if grep -q 'probe.test.sh' "$work/out"; then no "a test file is not listed"; else ok "a test file is not listed"; fi
if [ -s "$VP_LOG" ]; then no "no task runs nothing"; else ok "no task runs nothing"; fi

run_copy frobnicate
if [ -s "$VP_LOG" ]; then no "an unknown task runs nothing"; else ok "an unknown task runs nothing"; fi

run_copy check
expect_vp 'check' "a task runs vp from node_modules"

rm "$copy/node_modules/.bin/vp"
status=0
PATH=/usr/bin:/bin "$copy/do" test >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "a task that needs vp fails without it"
expect_err 'Run pnpm install' "a task that needs vp says how to get it"

finish
