# 1. Desktop Chromium only

Status: Accepted, 2026-10-04

## Context

The work must live in a folder the writer owns. Writable folder access in a browser (the File System Access API) exists only in Chromium; Mozilla rates it harmful and WebKit has declined it. Options: support every browser and give up the folder; ship a native shell now; or target desktop Chromium.

## Decision

v1 targets desktop Chromium (Chrome, Edge, Arc) as a PWA. Firefox and Safari are told up front that they can't keep work in a folder. Mobile, read-only included, is out of v1. Storage sits behind one adapter so the app can later be wrapped in Tauri for real file access on every OS.

## Consequences

We plan as if other browsers never gain folder access. A Tauri shell stays possible as a shell swap, not a rewrite, but bends the PWA constraint, so it waits until folder access beyond Chromium matters.
