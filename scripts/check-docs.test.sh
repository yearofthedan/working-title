#!/bin/sh

# Tests for ./do check-docs: the rule over a docs page's opening lines, the
# numbered record it leaves alone, and the files it does not read.

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

# A page's opening is what sits under its title, so the fixture writes a title
# and the two lines.
page() {
  mkdir -p "$project/$(dirname "$1")"
  printf '# A page\n\n**Audience:** anyone.\n**Purpose:** why it exists.\n' >"$project/$1"
}

# A page that breaks the rule, from a given opening.
raw() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%s' "$2" >"$project/$1"
}

# Only what git tracks is read, so the fixture stages what a case wrote.
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

# A clean tree passes, and says how many pages it read, so a run over nothing
# cannot read as a pass.
page docs/one.md
page docs/standards/two.md
stage
docs
expect_status 0 "a clean tree passes"
expect_out '^every one of the 2 docs pages opens with its audience and purpose$' "a pass says how many pages it read"

# Each line is required, and the page that lacks one is named with the rule.
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

# A page missing both is named once, not twice.
raw docs/neither.md '# A page

Nothing here.
'
stage
docs
expect_status 1 "a page with neither line breaks the rule"
if [ "$(grep -c '^docs/neither\.md$' "$work/out")" = 1 ]; then ok "a page missing both lines is named once"; else no "a page missing both lines is named once"; fi
rm "$project/docs/neither.md"
stage

# The record the exception names is left alone even though it opens with neither
# line, and a near miss of its name is not the exception.
raw docs/adr/0001-a-decision.md '# A decision

## Context

The record shape.
'
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

# The opening ends at the first "## " heading: the lines below it are not the
# opening, so a page that states them there still breaks the rule.
raw docs/late.md '# A page

## Who it is for

**Audience:** anyone.
**Purpose:** why it exists.
'
stage
docs
expect_status 1 "the lines after the first heading are not the opening"
expect_out '^docs/late\.md$' "the page stating both lines late is named"
rm "$project/docs/late.md"
stage

# A heading deeper than "## " does not end the opening, since the title is what
# the page opens with and a subheading still belongs to it.
raw docs/deep.md '# A page

**Audience:** anyone.

### Still the opening

**Purpose:** why it exists.
'
stage
docs
expect_status 0 "a subheading does not end the opening"
expect_out '^every one of the 3 docs pages opens with its audience and purpose$' "the page with a subheading passes"
rm "$project/docs/deep.md"
stage

# Only a markdown file under docs/ is a page.
raw NOTES.md 'Nothing here.
'
raw docs/notes.txt 'Nothing here.
'
stage
docs
expect_status 0 "a markdown file outside docs/ and a file that is not markdown are not read"

# A page git does not track is not read.
raw docs/untracked.md '# A page

Nothing here.
'
docs
expect_status 0 "a page git does not track is not read"
rm "$project/docs/untracked.md"

# A run that read nothing is not a pass.
empty="$work/empty"
mkdir -p "$empty"
(cd "$empty" || exit 1; git init -q -b main .)
docs_in "$empty"
expect_status 1 "a repository with no docs page is not a pass"
expect_err 'no docs page was read' "the failure says nothing was read"

# The rule this repository keeps: every page it holds passes.
docs_in "$root"
expect_status 0 "this repository's pages open with their audience and purpose"

finish
