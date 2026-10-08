# 11. No backend in v1

Status: Accepted, 2026-10-04, reason confirmed by Dan 2026-10-08

## Context

The app could store work on a server, which would bring accounts, sync and multiple devices. It would also bring infrastructure to run, secure and pay for. v1 is one writer on one desktop browser.

## Decision

No backend in v1: no server, no accounts, and no network after the first load. All storage is in the browser, mirrored to the writer's folder ([ADR 2](0002-browser-copy-mirrored-to-folder.md)). This keeps the infrastructure simple.

## Consequences

Sync and a second device are parked. If sync returns, it likely grows out of the folder (a folder inside Dropbox or iCloud). LLM integration is undecided and may need a backend, which would reopen storage; nothing in v1 is shaped for it, and nothing may make adding it later painful. Storage sits behind one adapter so a backend could slot in later.
