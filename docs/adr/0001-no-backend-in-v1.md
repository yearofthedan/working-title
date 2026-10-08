# 1. No backend in v1

Status: Accepted, 2026-10-04; reason confirmed 2026-10-08

## Context

- One person builds and runs the app, with no time or budget for operating services.
- v1 serves one writer on one desktop browser.
- Manuscripts are private; holding them on a server brings security and trust obligations.
- Later wants pull the other way: sync across devices, and possibly LLM features with our own logic on top, which would need server-side code.

## Decision

No backend in v1: no server, no accounts, and no network after the first load. All work is stored on the writer's machine.

## Consequences

The infrastructure stays simple. Sync and a second device are parked; if sync returns it likely grows out of the folder (a folder inside Dropbox or iCloud). An LLM feature may need a backend, which would reopen storage, so storage sits behind a port that a backend could implement later.
