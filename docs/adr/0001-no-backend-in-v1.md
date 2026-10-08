# 1. No backend in v1

Status: Accepted, 2026-10-04; reason confirmed 2026-10-08

## Context

Where does the writer's work live in v1: on a server we run, or on the writer's machine?

- One person builds and runs the app, with no time or budget for operating services.
- The vision has one writer working alone; collaboration is not in it. Devices, sync and local or cloud storage were left to the architecture stage to decide.
- Manuscripts are private; holding them on a server brings security and trust obligations.
- Later wants pull the other way: sync across devices, and possibly LLM features with our own logic on top, which would need server-side code.

## Decision

No backend in v1: no server, no accounts, and no network after the first load. All work is stored on the writer's machine, so v1 is single-device.

## Alternatives considered

- **A backend with accounts and cloud storage.** Gives sync and a second device, at the cost of servers to run, secure and pay for, and manuscripts held by us.
- **A hosted sync service on top of local storage.** Keeps work local but still adds an account, a third party and an ops dependency, for a second device v1 doesn't need.

## Consequences

The infrastructure stays simple. Sync and a second device are parked; if sync returns it likely grows out of the folder (a folder inside Dropbox or iCloud). An LLM feature may need a backend, which would reopen storage, so storage sits behind a port that a backend could implement later.
