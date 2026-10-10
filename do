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

# The window docs/lessons.md counts entries against, in commits behind main.
# What it means — commits rather than days, and which entries count as current —
# is in that file.
LESSON_WINDOW=${LESSON_WINDOW:-50}

lessons() {
  file=${1:-docs/lessons.md}
  case "$LESSON_WINDOW" in
  '' | *[!0-9]*)
    printf 'the lesson window must be a number of commits, not "%s".\n' "$LESSON_WINDOW" >&2
    return 1
    ;;
  esac
  base=origin/main
  git rev-parse --verify -q "$base" >/dev/null 2>&1 || base=main
  if [ ! -f "$file" ]; then
    echo "$file not found" >&2
    return 1
  fi

  rows=$(grep '^| ' "$file" | grep -v -- '^| --- ' | grep -v -- '^| Lesson ' | wc -l | tr -d ' ')
  report=$(grep '^| ' "$file" | grep -v -- '^| --- ' | grep -v -- '^| Lesson ' | while IFS= read -r row; do
    lesson=$(printf '%s' "$row" | cut -d'|' -f2 | sed 's/^ *//; s/ *$//')
    entries=$(printf '%s' "$row" | cut -d'|' -f3)
    numbers=$(printf '%s' "$entries" | grep -oE 'pull/[0-9]+|#[0-9]+' | sed 's|^pull/||; s|^#||' | sort -n -u) || true
    if [ -z "$numbers" ] && printf '%s' "$entries" | grep -qF ']('; then
      printf 'error: "%s" — the entry "%s" in Found in names no pull request\n' "$lesson" "$entries" >&2
      printf 'error\n'
      continue
    fi
    for pr in $numbers; do
      if ! answer=$(gh pr view "$pr" --json state,mergeCommit -q '"\(.state) \(.mergeCommit.oid // "")"' 2>/dev/null); then
        printf 'error: "%s" — gh could not read #%s\n' "$lesson" "$pr" >&2
        printf 'error\n'
        continue
      fi
      state=${answer%% *}
      sha=${answer#* }
      if [ "$state" = "CLOSED" ]; then
        printf 'drop: "%s" — #%s was closed without merging\n' "$lesson" "$pr"
        continue
      fi
      if [ "$state" != "MERGED" ]; then
        continue
      fi
      if ! behind=$(git rev-list --count "$sha..$base" 2>/dev/null); then
        printf 'error: "%s" — git could not count commits to #%s\n' "$lesson" "$pr" >&2
        printf 'error\n'
        continue
      fi
      if [ "$behind" -gt "$LESSON_WINDOW" ]; then
        printf 'drop: "%s" — #%s is %s commits behind %s, window %s\n' \
          "$lesson" "$pr" "$behind" "$base" "$LESSON_WINDOW"
      fi
    done
  done) || true
  dropped=$(printf '%s\n' "$report" | grep -c '^drop:' || true)
  failed=$(printf '%s\n' "$report" | grep -c '^error$' || true)

  if [ "$dropped" -eq 0 ] && [ "$failed" -eq 0 ]; then
    printf 'nothing past the window of %s commits, across %s rows.\n' "$LESSON_WINDOW" "$rows"
    return 0
  fi
  if [ "$dropped" -gt 0 ]; then
    printf '%s\n' "$report" | grep '^drop:' || true
    printf '%s to drop from %s; a row goes when its list empties.\n' "$dropped" "$file"
  fi
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
