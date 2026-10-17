#!/bin/sh

# Tests for ./do check-links: a link this repository writes that does not resolve, and the two halves it
# is made of — the one that reads the repository and the one that asks the sites it names.

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

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%s\n' "$2" >"$project/$1"
}

# The curl the module asks: it prints the status, writes the page it was given to the file after -o,
# exits as curl does, and says so in a file the cases read. Three addresses answer:
# example.com/docs holds the heading, example.com/other does not, and example.com/gone is a 404.
cat >"$work/bin/curl" <<'STUB'
#!/bin/sh
echo "$*" >>"$STUB_CALLS"
status=200
page=''
case "$*" in
*example.com/docs*) page='<h2 id=the-rule>The rule</h2>' ;;
*example.com/github*) page='<h2 id="user-content-the-rule">The rule</h2>' ;;
*example.com/other*) page='<p>No heading here</p>' ;;
*example.com/gone*) status=404 ;;
*example.com/busy*) status=503 ;;
esac
out=''
previous=''
for argument in "$@"; do
  [ "$previous" = '-o' ] && out=$argument
  previous=$argument
done
[ -n "$out" ] && printf '%s' "$page" >"$out"
printf '%s' "$status"
STUB
chmod +x "$work/bin/curl"
STUB_CALLS="$work/curl-calls"
export STUB_CALLS

# The module walks the files git tracks, so the fixture's are added first.
track() { (cd "$project" && git add -A); }

links() { # $1 the flags, if any; CI unset, so the machine is a builder's
  status=0
  : >"$STUB_CALLS"
  track
  (cd "$project" && env -u CI node "$root/scripts/_links.mjs" "$project" ${1:-}) >"$work/out" 2>"$work/err" || status=$?
}

good='# Guide

## The setup

See [the standard](standard.md#the-rule) and [the site](https://example.com/docs#the-rule).

```
[not a link](nowhere.md)
```

An inline `[not a link either](nowhere.md)` too.
'
write docs/standard.md '# Standard

## The rule

Text.
'

# A project whose links resolve: a path, a heading in it, an address with a heading on it, and one of
# each inside the places that hold no link at all.
write docs/guide.md "$good"
write scripts/thing.sh '# See [the guide](../docs/guide.md) and [the site](https://example.com/other).'
write src/thing.ts "// [the guide](../docs/guide.md) is where this is written down.
export const one = 1;"
links --external
expect_status 0 "a project whose links resolve passes"
expect_out 'every link' "a project whose links resolve says so"
# A pass says how much it read, so a run over nothing cannot read as a pass.
expect_out 'the 4 files' "a pass says how many files it read"

# An address on a line of code is not a link: only what a file says in prose or in a comment is.
write src/code.ts "export const elsewhere = 'https://example.com/gone';
"
links --external
expect_status 0 "an address on a line of code is not a link"
if grep -q 'warning' "$work/err"; then no "an address on a line of code is not a link, silently"; else ok "an address on a line of code is not a link, silently"; fi
write src/code.ts 'export const one = 1;'

# The id a page gives a heading is written with any quoting, and GitHub prefixes its own.
write docs/guide.md '# Guide

See [the site](https://example.com/docs#the-rule) and [the file](https://example.com/github#the-rule).
'
links --external
expect_status 0 "an id written without quotes is the heading it names"
if grep -q 'warning' "$work/err"; then no "an id written without quotes says nothing"; else ok "an id written without quotes says nothing"; fi

# A heading a file holds is where GitHub gives it an anchor: one inside a code block is text.
write docs/fence.md '# Fence

```
## Not a heading
```
'
write docs/guide.md '# Guide

See [the fence](fence.md#not-a-heading).
'
links
expect_status 1 "a heading inside a code block is not a heading"
expect_err '#not-a-heading' "a heading inside a code block is named"

write docs/underscore.md '# The node_modules directory

Text.
'
write docs/guide.md '# Guide

See [the directory](underscore.md#the-node_modules-directory).
'
links
expect_status 0 "an underscore stays in the anchor, as GitHub keeps it"

# A page that holds the heading it is asked for says nothing.
write docs/guide.md '# Guide

See [the site](https://example.com/docs#the-rule).
'
links --external
expect_status 0 "a page that holds the heading is not warned about"
if grep -q 'warning' "$work/err"; then no "a page that holds the heading says nothing"; else ok "a page that holds the heading says nothing"; fi

# A heading of two words around punctuation answers to a dash for each space, as GitHub resolves it.
write docs/template.md '# Before / After

Text.
'
write docs/guide.md '# Guide

See [the template](template.md#before--after).
'
links
expect_status 0 "a heading with punctuation in it answers to its own anchor"

write docs/guide.md '# Guide

See [the template](template.md#before-after).
'
links
expect_status 1 "the anchor GitHub does not give it is refused"
expect_err '#before-after' "the anchor GitHub does not give it is named"

# A path that is not there.
write docs/guide.md '# Guide

See [the standard](standard-elsewhere.md).
'
links
expect_status 1 "a path that is not there is refused"
expect_err 'standard-elsewhere.md' "a path that is not there is named"
expect_err 'docs/guide.md' "the file it is written in is named"

# A heading that is not there, in this repository and on the site.
write docs/guide.md '# Guide

See [the standard](standard.md#the-other-rule).
'
links
expect_status 1 "a heading this repository does not hold is refused"
expect_err '#the-other-rule' "a heading this repository does not hold is named"

write docs/guide.md '# Guide

See [the site](https://example.com/docs#no-such-rule).
'
links --external
expect_status 0 "a heading a page does not hold as it was sent is warned about"
expect_err '#no-such-rule' "a heading a page does not hold as it was sent is named"

# A site failing to answer is the site's moment, not the link's health, so it warns rather than
# refusing, after one more ask.
write docs/guide.md '# Guide

See [the site](https://example.com/busy).
'
links --external
expect_status 0 "a site answering 503 warns rather than refusing"
expect_err 'which is the site rather than the link' "the warning says it is the site"

# An address that does not answer.
write docs/guide.md '# Guide

See [the site](https://example.com/gone).
'
links --external
expect_status 1 "an address that answers 404 is refused"
expect_err '404' "an address that answers 404 says so"

# The half that reads the repository asks no site at all.
write docs/guide.md "$good"
links
expect_status 0 "the repository half passes on its own"
if [ ! -s "$STUB_CALLS" ]; then ok "the repository half asks no site"; else no "the repository half asks no site"; fi

# Nothing answers: a builder's machine is warned and CI is refused, as ./do audit does.
cat >"$work/bin/curl" <<'STUB'
#!/bin/sh
exit 7
STUB
chmod +x "$work/bin/curl"
links --external
expect_status 0 "an unreachable site warns on a builder's machine"
expect_err 'could not be reached' "the warning says what could not be reached"

status=0
track
(cd "$project" && env CI=true node "$root/scripts/_links.mjs" "$project" --external) >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "an unreachable site fails in CI"
expect_err 'could not be reached' "the CI failure says what could not be reached"

# A tree this check reads nothing from is refused, so a pass cannot read as one over nothing.
empty="$work/empty"
mkdir -p "$empty"
(cd "$empty" && git init -q -b main . && git config user.email t@example.com && git config user.name t && printf 'notes\n' > notes.txt && git add -A)
status=0
env -u CI node "$root/scripts/_links.mjs" "$empty" >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "a tree this check reads nothing from is refused"
expect_err 'checked nothing' "the refusal says nothing was read"

finish
