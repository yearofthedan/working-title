#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

project="$work/project"
mkdir -p "$project"
(
  cd "$project" || exit 1
  git init -q -b main .
  git config user.email t@example.com
  git config user.name t
)

page() {
  mkdir -p "$project/$(dirname "$1")"
  printf '# A page\n\n**Audience:** anyone.\n**Purpose:** why it exists.\n' >"$project/$1"
}

raw() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%b' "$2" >"$project/$1"
}

stage() {
  (cd "$project" || exit 1 && git add -A)
}

docs() {
  docs_in "$project"
}

docs_in() {
  status=0
  (
    cd "$1" || exit 1
    "$root/scripts/check-docs"
  ) >"$work/out" 2>"$work/err" || status=$?
}

page docs/one.md
page docs/standards/two.md
stage
docs
expect_status 0 "a clean tree passes"
expect_out '^every one of the 2 docs pages opens with its audience and purpose$' "a pass says how many pages it read"

raw docs/no-audience.md '# A page

**Purpose:** why it exists.
'
stage
docs
expect_status 1 "a page with no audience line breaks the rule"
expect_out '^docs/no-audience\.md$' "the page with no audience line is named"
expect_err 'states \*\*Audience:\*\* and \*\*Purpose:\*\*' "the failure states the rule"
expect_err 'The exception: a numbered record docs/adr/NNNN-\*\.md' "the failure states the exception"
rm "$project/docs/no-audience.md"
stage

raw docs/no-purpose.md '# A page

**Audience:** anyone.
'
stage
docs
expect_status 1 "a page with no purpose line breaks the rule"
expect_out '^docs/no-purpose\.md$' "the page with no purpose line is named"
rm "$project/docs/no-purpose.md"
stage

raw docs/neither.md '# A page

Nothing here.
'
stage
docs
expect_status 1 "a page with neither line breaks the rule"
if [ "$(grep -c '^docs/neither\.md$' "$work/out")" = 1 ]; then ok "a page missing both lines is named once"; else no "a page missing both lines is named once"; fi
rm "$project/docs/neither.md"
stage

docs_in "$project/docs"
expect_status 0 "the pages are read from a directory inside the repository"
expect_out '^every one of the 2 docs pages opens with its audience and purpose$' "the run from below reads them all"
raw docs/from-below.md '# A page

Nothing here.
'
stage
docs_in "$project/docs"
expect_status 1 "a page is judged when the check runs from below docs/"
expect_out '^docs/from-below\.md$' "a page judged from below is still named from the top of the tree"
rm "$project/docs/from-below.md"
stage

raw docs/adr/0001-a-decision.md '# A decision\n\n## Context\n\nThe record shape.\n'
stage
docs
expect_status 0 "a numbered record is not read"
expect_out '^every one of the 2 docs pages opens with its audience and purpose$' "the record is not counted"

raw docs/adr/README.md '# Records

An index.
'
stage
docs
expect_status 1 "docs/adr/README.md is read, so the whole directory is not the exception"
expect_out '^docs/adr/README\.md$' "the index is named"
rm "$project/docs/adr/README.md"
stage

raw docs/adr/12-a-decision.md '# A decision

Nothing here.
'
stage
docs
expect_status 1 "a record whose number is not four digits is read"
expect_out '^docs/adr/12-a-decision\.md$' "the near miss is named"
rm "$project/docs/adr/12-a-decision.md"
stage

raw docs/adr/0001-a-decision/note.md '# A note

Nothing here.
'
stage
docs
expect_status 1 "a record sits directly in docs/adr, so a page below a record is read"
expect_out '^docs/adr/0001-a-decision/note\.md$' "the page below the record is named"
rm -r "$project/docs/adr/0001-a-decision"
stage

raw docs/late.md '# A page\n\n## Who it is for\n\n**Audience:** anyone.\n**Purpose:** why it exists.\n'
stage
docs
expect_status 1 "the lines after the first heading are not the opening"
expect_out '^docs/late\.md$' "the page stating both lines late is named"
rm "$project/docs/late.md"
stage

raw docs/heads.md '## Who it is for

**Audience:** anyone.
**Purpose:** why it exists.
'
stage
docs
expect_status 1 "a page opening with a heading breaks the rule"
expect_out '^docs/heads\.md$' "the page whose first line is a heading is named"
rm "$project/docs/heads.md"
stage

raw docs/deep.md '# A page\n\n**Audience:** anyone.\n\n### Still the opening\n\n**Purpose:** why it exists.\n'
stage
docs
expect_status 0 "a subheading does not end the opening"
expect_out '^every one of the 3 docs pages opens with its audience and purpose$' "the page with a subheading passes"
rm "$project/docs/deep.md"
stage

raw NOTES.md 'Nothing here.
'
raw docs/notes.txt 'Nothing here.
'
stage
docs
expect_status 0 "a markdown file outside docs/ and a file that is not markdown are not read"

page docs/café.md
stage
docs
expect_status 0 "a page whose name is not ASCII is read"
expect_out '^every one of the 3 docs pages opens with its audience and purpose$' "that page is counted"
rm "$project/docs/café.md"
stage

raw docs/untracked.md '# A page

Nothing here.
'
docs
expect_status 0 "a page git does not track is not read"
rm "$project/docs/untracked.md"

empty="$work/empty"
mkdir -p "$empty"
(cd "$empty" || exit 1; git init -q -b main .)
docs_in "$empty"
expect_status 1 "a repository with no docs page is not a pass"
expect_err 'no docs page was read' "the failure says nothing was read"

nowhere="$work/nowhere"
mkdir -p "$nowhere"
docs_in "$nowhere"
expect_status 1 "a directory outside a working tree is refused"
expect_err 'not in a git working tree' "the refusal says the tree is what is missing"

docs_in "$root"
expect_status 0 "this repository's pages open with their audience and purpose"

finish
