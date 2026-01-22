# ADR 004: Process Template Pattern

## Status

Accepted

## Context

Writing methodologies (like the Snowflake Method) vary in their steps, rules, and structure. Hardcoding these into the application logic makes it difficult to support multiple methodologies.

## Decision

We will use a declarative "Process Template" to drive the UI and validation logic.

1. **Separation**: Decouple the project data (content) from the process definition (methodology).
2. **Schema**: Define a strict schema for templates (`processTemplateSpec.ts`).
3. **Data-Driven**: Components should query the active template to determine what to render and how to behave.

## Consequences

- **Pros**: Easy to add new methodologies; simplifies validation logic; allows for different "lenses" on the same project data.
- **Cons**: Requires careful schema design; adds complexity to data fetching (need both project and template).
