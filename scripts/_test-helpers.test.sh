#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy

marker=logged-its-call
for stub in "$copy/node_modules/.bin/"*; do
  name=$(basename "$stub")
  : >"$VP_LOG"
  "$stub" "$marker" >/dev/null 2>&1 || true
  if grep -q "$marker" "$VP_LOG"; then
    ok "$name logs its call"
  else
    no "$name logs its call"
  fi
done

finish
