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
  expect_vp_literal "node $copy/scripts/_screenshot.mjs $width $copy/screenshots/story-$width.png --load-storage $copy/scripts/_screenshot-long-sentences.json" \
    "the story at $width is a shot of the long sentences, with nothing clicked"
  expect_vp_literal "node $copy/scripts/_screenshot.mjs $width $copy/screenshots/beat-2-$width.png --load-storage $copy/scripts/_screenshot-long-sentences.json --click Beat 2" \
    "beat 2 at $width is a shot of the long sentences, with beat 2 clicked"
  expect_vp_literal "node $copy/scripts/_screenshot.mjs $width $copy/screenshots/eight-scenes-$width.png --load-storage $copy/scripts/_screenshot-eight-scenes.json --click Beat 4" \
    "the eight scenes at $width load the eight-scenes storage, with beat 4 clicked"
  expect_vp_literal "node $copy/scripts/_screenshot.mjs $width $copy/screenshots/scene-$width.png --load-storage $copy/scripts/_screenshot-long-sentences.json --click Beat 2 --click Scene 1" \
    "a scene at $width is a shot of the long sentences, with beat 2 and the scene clicked"
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
expect_no_vp 'node .*_screenshot.mjs.*' "screenshot takes no shot when 4174 already answers"

CURL_FAILS=999 VP_PREVIEW_STAYS= run_copy screenshot
expect_status 1 "screenshot gives up when the preview stops before answering"
expect_err 'stopped before it answered' "screenshot says the preview stopped"
expect_no_vp 'node .*_screenshot.mjs.*' "screenshot takes no shot when the preview stopped"

CURL_FAILS=999 VP_PREVIEW_STAYS=1 "$copy/do" screenshot >"$work/out" 2>"$work/err" &
run=$!
sleep 1
kill -TERM "$run"
status=0
wait "$run" || status=$?
expect_status 1 "screenshot exits 1 when it is signalled"
expect_err 'was interrupted' "screenshot says the run was interrupted"

finish
