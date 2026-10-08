---
name: writing-adrs
description: Decide whether a decision needs an architecture decision record, and write or supersede one in docs/adr. Use when a PR adds or changes a standing rule in docs/ARCHITECTURE.md.
---

# Writing ADRs

An ADR records why the architecture is the way it is, for someone who is about to change it. Records live in `docs/adr/`, one file per decision, listed in `docs/adr/README.md`.

## Does it need a record?

Write one only when all three hold:

1. **There was a real alternative.** A reasonable person could have chosen differently.
2. **Reversing it is expensive.** It shapes stored data, structure, or what other code relies on.
3. **The code can't answer "why is it like this?"**

Everything else goes somewhere else:

| It is… | It goes in |
| --- | --- |
| A product decision: what the writer sees, can do, or is offered | The product docs and the epic, never an ADR |
| A choice no story has proven yet, such as a library before it has met the quality targets | `docs/ARCHITECTURE.md` as a starting choice; the story that proves it writes the record |
| A convention that is cheap to change (file names, folder names, test style) | `docs/ARCHITECTURE.md` or `AGENTS.md` |
| A detail of how a decision is carried out (timings, syntax, port names) | `docs/ARCHITECTURE.md` as a rule |

## The record

File `docs/adr/NNNN-short-title.md`, the next number in order. Title names the decision, not the topic ("No backend in v1", not "Storage").

```markdown
# N. Title

Status: Accepted, YYYY-MM-DD

## Context

- One force per bullet, stated as fact.

## Decision

## Consequences
```

- **Context** lists the forces at play: constraints, quality targets, design principles, facts about the platform or the team, and the forces the decision goes against. It neither lists options nor argues for the outcome. A reader should be able to see why a reasonable person could land elsewhere.
- **Decision** states what was decided, in a few sentences, at the level that stays true while details change. No library names unless the decision is about that library and a story has proven it.
- **Consequences** states what follows, good and bad: what becomes easy, what becomes hard, what is now ruled out, and which checks enforce it.
- Names no person and tells no story of how the decision was reached.

## After writing

- Add a row to the index in `docs/adr/README.md`.
- Link the record from the rule it explains in `docs/ARCHITECTURE.md`.
- Re-read the record against the three tests and the table above. A record that fails one is deleted, not softened.

## Changing a decision

A merged record is never edited. Write a new record that supersedes it, set the old record's status to `Superseded by [N](NNNN-title.md)`, update the index, and repoint the rule in `docs/ARCHITECTURE.md`.
