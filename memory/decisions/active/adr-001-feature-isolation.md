# ADR 001: Feature Isolation

## Status

Accepted

## Context

The project has multiple domain modules (Snowflake, Canvas, Sidebar). Without clear boundaries, features tend to become tightly coupled, making them hard to test and modify independently.

## Decision

We will enforce strict feature isolation. Each feature should be a self-contained module in `src/features/[feature-name]/`.

1. **No Cross-Feature Imports**: A feature must not import from another feature's internal directories.
2. **Public API**: If a feature must expose functionality, it should do so via its root-level index or a dedicated service.
3. **Shared Logic**: Logic needed by multiple features must move to `src/utils/` or `src/features/common/`.

## Consequences

- **Pros**: Higher cohesion, easier testing, faster builds (due to less coupling), clearer ownership.
- **Cons**: Initial overhead in moving shared logic; might require more boilerplate for communication between features.
