#!/bin/sh

# Tasks for this repo. Run ./do with no task to see them.

set -eu

usage() {
  cat <<'EOF'
usage: ./do <task>

Tasks:
  setup      Install the skills the build work runs under into your OMP.
EOF
}

# Ponytail is installed into the builder's OMP, not into the repo, so a fresh
# clone has to install it. Both omp commands fail when they are already done,
# so each one is checked first.
setup() {
  if omp plugin list --json 2>/dev/null | grep -qF 'ponytail@ponytail'; then
    echo "Ponytail is already installed."
    return 0
  fi
  if ! omp plugin marketplace list 2>/dev/null | grep -qF 'DietrichGebert/ponytail'; then
    omp plugin marketplace add DietrichGebert/ponytail
  fi
  omp plugin install ponytail@ponytail
  echo "Installed Ponytail. Run /reload-plugins in an open OMP session to load it."
}

case "${1:-}" in
setup) setup ;;
*)
  usage >&2
  exit 2
  ;;
esac
