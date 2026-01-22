# ADR 005: Layout Decoupling

## Status

Accepted

## Context

Running complex graph layout algorithms (like ELK) directly within Vue's reactivity cycle can cause performance bottlenecks and UI stuttering, especially on large graphs.

## Decision

We will decouple the layout calculation from the immediate Vue rendering cycle.

1. **Adapter Pattern**: Use an adapter (`elkLayoutAdapter.ts`) to bridge our project data and the ELK algorithm.
2. **Debouncing**: Debounce layout updates to prevent excessive recalculations.
3. **Background Processing**: (Future) Run layout in a Web Worker to keep the main thread responsive.

## Consequences

- **Pros**: Smoother UI; better performance for large graphs; cleaner separation between data and layout logic.
- **Cons**: Layout updates are not instantaneous (brief delay).
