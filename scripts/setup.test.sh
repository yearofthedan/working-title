#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
VP_LOG="$work/calls"
export VP_LOG
printf '#!/bin/sh\necho "weaver $*" >> "$VP_LOG"\n' >"$copy/node_modules/.bin/weaver"
chmod +x "$copy/node_modules/.bin/weaver"
: >"$VP_LOG"
run_copy setup
expect_status 0 "setup succeeds with weaver installed"
if grep -qF "weaver skills install --dir $copy/.agents/skills --force" "$VP_LOG"; then
  ok "setup installs weaver's skills into .agents/skills"
else
  no "setup installs weaver's skills into .agents/skills"
fi

rm "$copy/node_modules/.bin/weaver"
mkdir -p "$work/tools"
for tool in dirname; do ln -s "$(command -v "$tool")" "$work/tools/$tool"; done
status=0
PATH="$work/tools" "$copy/do" setup >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "setup fails when weaver is not installed"
expect_err 'Run pnpm install, then ./do setup again' "setup says how to fix it"

finish
