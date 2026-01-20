# ADR 003: Dormant Components

## Status

Accepted

## Context

Heavy third-party libraries (like Tiptap) significantly increase initial load time and memory usage when many instances are rendered simultaneously (e.g., in a large graph).

## Decision

We will implement "Dormant Components" for heavy dependencies.

1. **Static First**: Render a lightweight, read-only version of the component by default.
2. **On-Demand Activation**: Only initialize the full, interactive library when the user interacts with the component (e.g., clicks to edit).
3. **Lazy Loading**: Use `defineAsyncComponent` for the full-featured versions.

## Consequences

- **Pros**: Drastically improved initial rendering performance and reduced memory footprint.
- **Cons**: Small delay ("hydration jump") when activating a component for the first time.
