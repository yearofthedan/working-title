# ADR 002: View Model Pattern

## Status

Accepted

## Context

Directly binding UI components to raw data structures (like `ProjectData`) leads to complex templates and logic duplication across different views (Canvas vs Detailed Editor).

## Decision

We will use the View Model pattern to transform raw domain data into UI-specific models.

1. **Location**: View models live in feature-specific `composables/`.
2. **Responsibility**: They handle data transformation, filtering, and state management for a specific view.
3. **Reactive**: They return reactive state (refs/computeds) that components can directly consume.

## Consequences

- **Pros**: Components stay lean and focused on rendering; data transformation logic is centralized and testable; multiple views can easily stay in sync.
- **Cons**: Adds a layer of abstraction; requires keeping view models in sync with domain data.
