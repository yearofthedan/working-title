# Feature Plan Template

## Overview

Brief description of the feature and its purpose.

## Goals

- [ ] Goal 1
- [ ] Goal 2

## Out of scope

## High level architecture, data flow

- **ADR Alignment**: (e.g., ADR-001 Isolation, ADR-003 Dormant Components)
- **State Management**: (e.g., Local ref, Props/Emits, or Feature Context)
- **Data Flow**: (e.g., Parent-to-child via props, updates via feature-level composable)

## User Stories

### Value statement

- As a user, I want to...

### Acceptance criteria

- Given... When.. .Then...
- Given... When.. .Then...
- Given... When.. .Then...

### Technical notes

- High level implementation notes
- Specific data contract
- Complex testing or technical considerations

## Definition of Done (DoD)

- [ ] Feature isolation (ADR-001) verified (No illegal imports).
- [ ] Components adhere to < 60 line limit.
- [ ] Builders created in `__testHelpers__/`.
- [ ] Interaction tests pass in Vitest Browser Mode.
- [ ] Storybook stories created with Smoke Tests.
- [ ] Can interact through thw browser with the feature
- [ ] Relevant documentation created / updated
- [ ] Any tech issues / debt / new scope captured for the future
