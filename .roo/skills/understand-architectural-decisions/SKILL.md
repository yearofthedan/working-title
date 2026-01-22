---
name: understand-architectural-decisions
description: Explore detailed rationale behind feature isolation, view models, dormant components, and other structural patterns. Use when architecting new features or understanding why the codebase is structured this way.
---

# Understand Architectural Decisions

Access Architectural Decision Records (ADRs) to understand context, rationale, and trade-offs behind key structural patterns.

## When to Use

- Architecting a new feature and need to align with established patterns
- Wondering why code is organized a certain way
- Evaluating whether to follow or challenge an existing pattern
- Need detailed context beyond high-level architecture rules

## What are ADRs?

Architectural Decision Records document significant structural decisions. Each captures:
- **Context**: The problem or situation
- **Decision**: What was decided and implementation rules
- **Consequences**: Trade-offs and limitations

## Key ADRs

- [**Feature Isolation**](/memory/decisions/active/adr-001-feature-isolation.md) - No cross-feature imports, self-contained modules
- [**View Model Pattern**](/memory/decisions/active/adr-002-view-model-pattern.md) - Transform domain data for UI consumption
- [**Dormant Components**](/memory/decisions/active/adr-003-dormant-components.md) - Lazy initialization for heavy dependencies

## How to Use

**Quick reference**: Read the **Decision** section for specific rules

**Deep understanding**: Read full ADR (Context → Decision → Consequences) when architecting or challenging patterns

**Challenging a decision**: ADRs are not immutable. If you have compelling reasons to deviate, document why and propose alternatives that preserve benefits.

## References

- [ADR Index](/memory/decisions/index.md) - All architectural decisions
- [Architecture Rules](../../rules/architecture.md) - High-level principles
