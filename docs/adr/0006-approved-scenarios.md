# 6. Approved scenarios as file snapshots

Status: Accepted, 2026-10-04, format agreed 2026-10-08

## Context

Dan judges behaviour, and agents write both the code and its tests. Assertion code is hard to review and easy to make pass on wrong code. Options: assertion-style use-case tests, Gherkin and Cucumber, or approved scenarios.

## Decision

Use-case tests are the bulk and write readable `.approved.md` files through a dedicated domain-language printer, compared with Vitest's `toMatchFileSnapshot`. The file opens with a one-sentence rule; each scenario is a heading naming the behaviour, with Given, When and Then as a tree in a fenced block, in glossary words. CI never writes or updates snapshots.

## Consequences

Review is a readable diff; rubber-stamping is the known failure mode. The printer is separate from the mirror format, so a mirror change does not rewrite every approval. Domain invariants keep their own unit and property tests, and mutation testing checks that tests would fail on wrong code.
