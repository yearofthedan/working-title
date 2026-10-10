#!/bin/sh

# Tasks for this repo. Run ./do with no task to see them.

set -eu

usage() {
  cat <<'EOF'
usage: ./do <task>

Tasks:
  setup      Install Ponytail, the skill the build work runs under, into your OMP.
  lessons    List the lesson entries past the window in docs/lessons.md.
EOF
}

# Ponytail is installed into the builder's OMP, not into the repo, so a fresh
# clone has to install it. Both omp commands fail when they are already done,
# so each one is checked first.
setup() {
  if ! command -v omp >/dev/null 2>&1; then
    echo "omp is not on your PATH. Install OMP, then run ./do setup again." >&2
    return 1
  fi
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

# The window docs/lessons.md counts against: entries older than this many commits
# behind main come off the list. Commits, not days, so a quiet stretch expires
# nothing. An entry whose pull request has not merged yet counts as current.
LESSON_WINDOW=${LESSON_WINDOW:-50}

lessons() {
  file=${1:-docs/lessons.md}
  base=origin/main
  git rev-parse --verify -q "$base" >/dev/null 2>&1 || base=main
  if [ ! -f "$file" ]; then
    echo "$file not found" >&2
    return 1
  fi

  rows=$(grep '^| ' "$file" | grep -v -- '^| --- ' | grep -v -- '^| Lesson ' | wc -l | tr -d ' ')
  report=$(grep '^| ' "$file" | grep -v -- '^| --- ' | grep -v -- '^| Lesson ' | while IFS= read -r row; do
    pr=$(printf '%s' "$row" | grep -o '#[0-9][0-9]*' | tail -n 1 | tr -d '#')
    [ -n "$pr" ] || continue
    lesson=$(printf '%s' "$row" | cut -d'|' -f2 | cut -c1-58)
    sha=$(gh pr view "$pr" --json mergeCommit -q '.mergeCommit.oid // empty' 2>/dev/null || true)
    if [ -z "$sha" ]; then
      continue
    fi
    behind=$(git rev-list --count "$sha..$base" 2>/dev/null || echo 0)
    if [ "$behind" -gt "$LESSON_WINDOW" ]; then
      printf 'drop: "%s" — newest entry #%s is %s commits behind %s, window %s\n' \
        "$lesson" "$pr" "$behind" "$base" "$LESSON_WINDOW"
    fi
  done || true)
  stale=$(printf '%s\n' "$report" | grep -c '^drop:' || true)

  if [ "$stale" -eq 0 ]; then
    printf 'nothing past the window of %s commits, across %s rows.\n' "$LESSON_WINDOW" "$rows"
    return 0
  fi
  printf '%s\n' "$report"
  printf '%s to drop from %s; a row goes when its list empties.\n' "$stale" "$file"
  return 1
}

case "${1:-}" in
setup) setup ;;
lessons) lessons "${2:-}" ;;
*)
  usage >&2
  exit 2
  ;;
esac
