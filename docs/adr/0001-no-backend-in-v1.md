# 1. No backend in v1

Status: Accepted, 2026-10-04; reason confirmed 2026-10-08

## Context

v1 is one writer on one desktop browser. A server would bring accounts, sync and a second device, and also infrastructure to run, secure and pay for.

## Decision

No backend in v1: no server, no accounts, and no network after the first load. All work is stored on the writer's machine.

## Consequences

The infrastructure stays simple. Sync and a second device are parked; if sync returns it likely grows out of the folder (a folder inside Dropbox or iCloud). An LLM feature may need a backend, which would reopen storage, so storage sits behind a port that a backend could implement later.
