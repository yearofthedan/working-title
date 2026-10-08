# 2. Hexagonal layers

Status: Accepted, 2026-10-04

## Context

How is the code split, and which way may its parts depend on each other?

- **Agents copy.** Agents write most of the code and copy the patterns they find.
- **Storage may move.** Storage may later move behind a native shell or a backend.
- **Editor format.** The editor's internal document format must not become the stored or domain format.
- **Fast tests.** Behaviour has to be testable without a browser, fast enough to run on save.

## Options considered

| Option | Agents copy | Storage may move | Editor format | Fast tests |
| --- | --- | --- | --- | --- |
| Hexagonal layers | Lint enforces direction | Swap behind a port | Converted in an adapter | Use cases on fakes |
| Logic in UI components | Logic spreads across screens | Touches every screen | Leaks into logic | Browser only |
| Plain layers without ports | Better | Core depends on the library | Core depends on the editor | Needs the real libraries |

## Decision

Domain, application, ports and adapters. Dependencies point inward only, and the UI calls only application use cases. Prose is opaque to the domain; an adapter converts it.

## Consequences

Dependency direction and domain purity are lint rules that fail as you type. Storage, mirror and editor can each be replaced behind their port.
