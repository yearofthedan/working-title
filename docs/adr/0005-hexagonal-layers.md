# 5. Hexagonal layers

Status: Accepted, 2026-10-04

## Context

Agents write most of the code, the storage may later move behind Tauri or a backend, and the editor's format must not leak into the core. Options: a conventional React app with logic in components, or ports and adapters.

## Decision

Hexagonal: domain (pure TypeScript), application (use cases and queries), ports (`ProjectStore`, `Mirror`, `ProseCodec`) and adapters (Dexie, the folder mirror, the React UI with Tiptap and React Flow). Dependencies point inward only. The UI calls only application use cases.

## Consequences

Direction, domain purity and the method-vocabulary ban are lint rules that fail as you type. Prose is opaque to the domain; the codec turns it into Markdown and lists its mentions. Shared code follows the shared-folder rules in ARCHITECTURE.md.
