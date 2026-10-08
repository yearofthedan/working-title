# 9. Stack

Status: Accepted, 2026-10-04

## Context

The stack has to meet the typing, movement and round-trip targets in a browser with no server.

## Decision

Tiptap (on ProseMirror) for the editor, because its schema whitelists exactly which formatting exists, which makes the Markdown round-trip enforceable, and mentions are a native custom node. React and Vite for the UI, because the editor and graph libraries are React-first. vite-plugin-pwa for offline and install. React Flow for the graph, which suits per-view graphs of tens of pieces. Dexie over IndexedDB. CSS custom properties as design tokens. Two bundled, precached typefaces.

## Consequences

React Flow does no layout itself, so epic 1 chooses a layout approach and proves it against the speed targets. Dark mode and later skins are token swaps, never component changes.
