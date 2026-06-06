---
name: brainstorm
description: "You MUST use this before any creative work - creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
metadata:
  internal: true
---

<!-- Adapted from superpowers by Jesse Vincent (MIT). See LICENSE in this directory. -->

# Brainstorming Ideas Into Designs

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

Start by understanding the current project context, then ask questions one at a time to refine the idea. Once you understand what you're building, present the design and get user approval.

<HARD-GATE>
Do NOT invoke any implementation skill, write any code, scaffold anything, or take any implementation action until you have presented a design and the user has approved it. This applies to every behaviour change regardless of perceived simplicity. The one exception is a handoff.md `[chore]` — unambiguous deferred admin (config tweaks, dep bumps, doc edits, dead-code removal) where the decision is already made; those go straight to implementation.
</HARD-GATE>

## Anti-Pattern: "This Is Too Simple To Need A Design"

Every behaviour change goes through this process — a single component, a composable, a new behaviour. "Simple" changes are where unexamined assumptions cause the most wasted work. The design can be short (a few sentences), but you MUST present it and get approval. (Genuine `[chore]` items are the exception — see the hard gate.)

## Checklist

Complete these in order:

1. **Explore project context** — check files, docs, recent commits
2. **Ask clarifying questions** — one at a time, understand purpose/constraints/success criteria
3. **Propose 2-3 approaches** — with trade-offs and your recommendation
4. **Present design** — in sections scaled to their complexity, get approval after each
5. **Write spec** — use `/spec` to create the spec file (handles location, template, handoff.md integration)
6. **User reviews written spec** — ask the user to review the spec file before proceeding
7. **Transition to implementation** — use `/slice` to implement the spec

**The terminal state is `/slice`.** This project's workflow is `handoff → /brainstorm → /spec → /slice`.

## The Process

**Understanding the idea:**

- Check the current project state first (files, docs, recent commits)
- Before detailed questions, assess scope: if the request describes multiple independent pieces, flag it and help decompose before refining details. Each sub-piece gets its own spec → slice cycle.
- For appropriately-scoped work, ask questions one at a time — purpose, constraints, success criteria. Prefer multiple choice. One question per message.
- Don't burn questions on what an implementer should just decide: styling/spacing/icon choices, variable or function names, or conventions already set in the codebase (Pinia, Tailwind, feature isolation, etc.). Ask about architectural forks, scope, and genuine tradeoffs; delegate the rest.

**Exploring approaches:**

- Propose 2-3 different approaches with trade-offs
- Lead with your recommendation and explain why

**Presenting the design:**

- Scale each section to its complexity: a few sentences if straightforward, up to 200-300 words if nuanced
- Ask after each section whether it looks right
- Cover: architecture/placement (which feature owns it, what's a composable vs component), data flow, states (empty/loading/error), testing

**Design for isolation and clarity:**

- Break the work into units with one clear purpose, communicating through well-defined interfaces, understandable and testable independently
- For each unit: what does it do, how do you use it, what does it depend on?
- Can someone understand a unit without reading its internals? Can you change internals without breaking consumers? If not, the boundaries need work.
- Respect feature isolation and the domain/UI split (see `docs/architecture.md`).

**Working in existing code:**

- Explore the current structure before proposing changes. Follow existing patterns.
- Where existing code has problems that affect the work (an oversized component, tangled responsibilities), include targeted improvements as part of the design.
- Don't propose unrelated refactoring. Stay focused on the goal.

## After the Design

**Spec creation:** Use `/spec`. Commit the spec to git.

**Spec self-review:** Read it with fresh eyes — scan for TBD/TODO/vague requirements, internal contradictions, scope creep, and ambiguity. Fix inline.

**User review gate:** Ask the user to review the written spec before proceeding. If they request changes, make them and re-review. Only proceed once approved.

**Implementation:** Use `/slice`.

## Key Principles

- **One question at a time** — don't overwhelm
- **Multiple choice preferred** — easier to answer
- **YAGNI ruthlessly** — remove unnecessary features
- **Explore alternatives** — 2-3 approaches before settling
- **Incremental validation** — present, get approval, move on
- **Be flexible** — go back and clarify when something doesn't fit
