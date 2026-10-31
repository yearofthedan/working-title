#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

node -e 'require("node:http").createServer((_, response) => { response.writeHead(200); response.end(); }).listen(4173)' 2>/dev/null &
held=$!
trap 'kill "$held" 2>/dev/null || true; wait "$held" 2>/dev/null || true; rm -rf "$work"' EXIT

tries=0
until curl -fsS http://localhost:4173 >/dev/null 2>&1; do
  tries=$((tries + 1))
  if [ "$tries" -ge 50 ]; then
    echo "nothing answered on 4173" >&2
    exit 1
  fi
  sleep 0.1
done

run_do e2e e2e/manifest.spec.ts
expect_status 0 "e2e passes while another worktree answers on 4173"
expect_out '1 passed' "the spec ran"

finish
