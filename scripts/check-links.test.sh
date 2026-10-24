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

write() {
  mkdir -p "$project/$(dirname "$1")"
  printf '%b\n' "$2" >"$project/$1"
}

printf '#!/bin/sh\n' >"$work/bin/curl"
cat >>"$work/bin/curl" <<'STUB'
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

track() { (cd "$project" && git add -A); }

links() {
  status=0
  : >"$STUB_CALLS"
  track
  (cd "$project" && env -u CI node "$root/scripts/_check-links.mjs" "$project" ${1:-}) >"$work/out" 2>"$work/err" || status=$?
}

good='# Guide\n\n## The setup\n\nSee [the standard](standard.md#the-rule) and [the site](https://example.com/docs#the-rule).\n\n```\n[not a link](nowhere.md)\n```\n\nAn inline `[not a link either](nowhere.md)` too.\n'
write docs/standard.md '# Standard\n\n## The rule\n\nText.\n'

write docs/guide.md "$good"
write scripts/thing.sh '# See [the guide](../docs/guide.md) and [the site](https://example.com/other).'
write src/thing.ts "// [the guide](../docs/guide.md) is where this is written down.
export const one = 1;"
links --external
expect_status 0 "a project whose links resolve passes"
expect_out 'every link' "a project whose links resolve says so"
expect_out 'the 4 files' "a pass says how many files it read"

write src/code.ts "export const elsewhere = 'https://example.com/gone';
"
links --external
expect_status 0 "an address on a line of code is not a link"
if grep -q 'warning' "$work/err"; then no "an address on a line of code is not a link, silently"; else ok "an address on a line of code is not a link, silently"; fi
write src/code.ts 'export const one = 1;'

write docs/guide.md '# Guide

See [the site](https://example.com/docs#the-rule) and [the file](https://example.com/github#the-rule).
'
links --external
expect_status 0 "an id written without quotes is the heading it names"
if grep -q 'warning' "$work/err"; then no "an id written without quotes says nothing"; else ok "an id written without quotes says nothing"; fi

write docs/fence.md '# Fence\n\n```\n## Not a heading\n```\n'
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

write docs/guide.md '# Guide

See [the site](https://example.com/docs#the-rule).
'
links --external
expect_status 0 "a page that holds the heading is not warned about"
if grep -q 'warning' "$work/err"; then no "a page that holds the heading says nothing"; else ok "a page that holds the heading says nothing"; fi

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

write docs/guide.md '# Guide

See [the standard](standard-elsewhere.md).
'
links
expect_status 1 "a path that is not there is refused"
expect_err 'standard-elsewhere.md' "a path that is not there is named"
expect_err 'docs/guide.md' "the file it is written in is named"

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

write docs/guide.md '# Guide

See [the site](https://example.com/busy).
'
links --external
expect_status 0 "a site answering 503 warns rather than refusing"
expect_err 'which is the site rather than the link' "the warning says it is the site"

write docs/guide.md '# Guide

See [the site](https://example.com/gone).
'
links --external
expect_status 1 "an address that answers 404 is refused"
expect_err '404' "an address that answers 404 says so"

write docs/guide.md "$good"
links
expect_status 0 "the repository half passes on its own"
if [ ! -s "$STUB_CALLS" ]; then ok "the repository half asks no site"; else no "the repository half asks no site"; fi

printf '#!/bin/sh\nexit 7\n' >"$work/bin/curl"
chmod +x "$work/bin/curl"
links --external
expect_status 0 "an unreachable site warns on a builder's machine"
expect_err 'could not be reached' "the warning says what could not be reached"

status=0
track
(cd "$project" && env CI=true node "$root/scripts/_check-links.mjs" "$project" --external) >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "an unreachable site fails in CI"
expect_err 'could not be reached' "the CI failure says what could not be reached"

empty="$work/empty"
mkdir -p "$empty"
(cd "$empty" && git init -q -b main . && git config user.email t@example.com && git config user.name t && printf 'notes\n' > notes.txt && git add -A)
status=0
env -u CI node "$root/scripts/_check-links.mjs" "$empty" >"$work/out" 2>"$work/err" || status=$?
expect_status 1 "a tree this check reads nothing from is refused"
expect_err 'checked nothing' "the refusal says nothing was read"

finish
