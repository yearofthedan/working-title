# Memory System

The Memory system captures project history, architectural decisions, and technical patterns. It helps prevent regressions and ensures consistent implementation of design principles.

## Structure

- **[Decisions](decisions/index.md)** - ADRs (Architectural Decision Records) capturing the "why" behind major choices.
- **[Patterns](patterns/index.md)** - Reusable implementation strategies for common tasks.
- **[Gotchas](gotchas.md)** - Known issues, non-obvious constraints, and their solutions.

## Usage for Agents

1. **Before starting a task**: Check relevant Patterns to ensure consistent implementation.
2. **When facing an error**: Check Gotchas for known issues.
3. **When proposing changes**: Consult Decisions to understand existing architectural constraints.
4. **After finishing a task**: If you discovered a new pattern or solved a significant gotcha, update the respective files.
