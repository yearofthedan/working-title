#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
mkdir -p "$copy/screenshots"
touch "$copy/screenshots/stale.png"
run_copy screenshot

expect_status 0 "screenshot exits 0"
expect_vp 'build' "screenshot builds the app"
expect_vp 'preview --port 4174 --strictPort' "screenshot serves the build on 4174"
expect_vp 'playwright install --with-deps chromium' "screenshot installs chromium"

for width in 1440 1100; do
  expect_vp_literal "playwright screenshot --viewport-size $width, 900 --full-page http://localhost:4174 $copy/screenshots/new-project-$width.png" \
    "the new project at $width is a full-page $width by 900 shot"
  expect_vp_literal "playwright screenshot --viewport-size $width, 900 --full-page --load-storage $copy/scripts/_screenshot-long-sentences.json http://localhost:4174 $copy/screenshots/long-sentences-$width.png" \
    "the long sentences at $width load the storage file"
done

if [ -e "$copy/screenshots/stale.png" ]; then
  no "screenshot empties screenshots/ first"
else
  ok "screenshot empties screenshots/ first"
fi

finish
