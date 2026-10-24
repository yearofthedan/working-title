#!/bin/sh

root=$(cd "$(dirname "$0")/.." && pwd)
. "$root/scripts/_test-helpers"

make_copy
mkdir -p "$copy/screenshots"
touch "$copy/screenshots/stale.png"
CURL_FAILS=2 VP_PREVIEW_STAYS=1 run_copy screenshot

expect_status 0 "screenshot exits 0"
expect_vp 'build' "screenshot builds the app"
expect_vp 'preview --port 4174 --strictPort' "screenshot serves the build on 4174"
expect_vp 'curl -fsS http://localhost:4174' "screenshot checks what answers on 4174"
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

CURL_FAILS=0 VP_PREVIEW_STAYS= run_copy screenshot
expect_status 1 "screenshot refuses a server it did not start"
expect_err 'already answering on 4174' "screenshot says what already answers on 4174"
expect_no_vp 'preview --port 4174 --strictPort' "screenshot starts no preview when 4174 already answers"
expect_no_vp 'playwright screenshot.*' "screenshot takes no shot when 4174 already answers"

CURL_FAILS=999 VP_PREVIEW_STAYS= run_copy screenshot
expect_status 1 "screenshot gives up when the preview stops before answering"
expect_err 'stopped before it answered' "screenshot says the preview stopped"
expect_no_vp 'playwright screenshot.*' "screenshot takes no shot when the preview stopped"

finish
