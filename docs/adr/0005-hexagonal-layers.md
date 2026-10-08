# 5. Hexagonal layers

Status: Accepted, 2026-10-04

## Context

How is the code split, and which way may its parts depend on each other?

- Agents write most of the code and copy the patterns they find.
- Storage may later move behind a native shell or a backend.
- The editor's internal document format must not become the stored or domain format.
- Behaviour has to be testable without a browser, fast enough to run on save.

## Decision

Domain, application, ports and adapters. Dependencies point inward only, and the UI calls only application use cases. Prose is opaque to the domain; an adapter converts it.

## Alternatives considered

- **Logic in UI components.** Quickest to start, but behaviour can only be tested through the browser, and swapping storage or editor means touching every screen.
- **Plain layers without ports.** Separates UI from logic, but the core still depends on the storage and editor libraries, so they can't be swapped or faked.

## Consequences

Dependency direction and domain purity are lint rules that fail as you type. Storage, mirror and editor can each be replaced behind their port.
