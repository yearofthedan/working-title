# 5. Hexagonal layers

Status: Accepted, 2026-10-04

## Context

- Agents write most of the code and copy the patterns they find.
- Storage may later move behind a native shell or a backend.
- The editor's internal document format must not become the stored or domain format.
- Behaviour has to be testable without a browser, fast enough to run on save.

## Decision

Domain, application, ports and adapters. Dependencies point inward only, and the UI calls only application use cases. Prose is opaque to the domain; an adapter converts it.

## Consequences

Dependency direction and domain purity are lint rules that fail as you type. Storage, mirror and editor can each be replaced behind their port.
