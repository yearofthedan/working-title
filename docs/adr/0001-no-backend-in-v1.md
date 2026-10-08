# 1. No backend in v1

Status: Accepted, 2026-10-04

## Context

Where does the writer's work live in v1: on a server we run, or on the writer's machine?

- **Solo builder.** One person builds and runs the app, with no time or budget for operating services.
- **Solo writer.** The vision has one writer working alone; collaboration is not in it. Devices, sync and local or cloud storage were left to the architecture stage to decide.
- **Privacy.** Manuscripts are private; holding them on a server brings security and trust obligations.
- **Later wants.** Sync across devices, and possibly LLM features with our own logic on top, would need server-side code.

## Decision

No backend in v1: no server, no accounts, and no network after the first load. All work is stored on the writer's machine, so v1 is single-device.

## Alternatives considered

| Option | Solo builder | Solo writer | Privacy | Later wants |
| --- | --- | --- | --- | --- |
| **No backend (chosen)** | Nothing to run | Fits | Work stays with the writer | Deferred; storage port leaves room |
| Backend with accounts and cloud storage | Servers to run, secure, pay for | More than needed | We hold manuscripts | Ready |
| Hosted sync service over local storage | Account and outside dependency | Second device not asked for | Third party holds copies | Sync only |

## Consequences

The infrastructure stays simple. Sync and a second device are parked; if sync returns it likely grows out of the folder (a folder inside Dropbox or iCloud). An LLM feature may need a backend, which would reopen storage, so storage sits behind a port that a backend could implement later.
