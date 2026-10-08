---
name: writing-adrs
description: Decide whether a decision needs an architecture decision record, and write or supersede one in docs/adr. Use whenever a decision adds or changes a standing rule in docs/architecture.md, while planning a story or while building one.
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
| A choice no story has proven yet, such as a library before it has met the quality targets | `docs/architecture.md` as a starting choice; the story that proves it writes the record |
| A convention that is cheap to change (file names, folder names, test style) | `docs/architecture.md` or `AGENTS.md` |
| A detail of how a decision is carried out (timings, syntax, port names) | `docs/architecture.md` as a rule |

## The record

File `docs/adr/NNNN-short-title.md`, the next number in order. Title names the decision, not the topic ("No backend in v1", not "Storage").

```markdown
# N. Title

Status: Proposed, YYYY-MM-DD

## Context

The question that had to be answered, in one sentence.

- **Short name.** One force per bullet, stated as fact.

## Options considered

| Option | Force A | Force B |
| --- | --- | --- |
| Chosen option | How it fares | How it fares |
| Other option | How it fares | How it fares |

## Decision

## Consequences
```

- **Context** opens with the question that had to be answered, in one sentence, so the reader knows what was being decided before reading why. It then lists the forces at play, each with a short bold name that the options table reuses as a column: constraints, quality targets, design principles, facts about the platform or the team, and the forces the decision goes against. Options go under Options considered, not here, and the context doesn't argue for the outcome. A reader should be able to see why a reasonable person could land elsewhere.
- **Options considered** is a table: one row per real option, the chosen one first, and one column per force from Context, named by its short name. Each cell says in a few words how that option fares against that force. A drawback with no force column is not a reason: if no column rules an option out, the context is missing a force or the option didn't lose. This is the evidence for the first test; a record with only one row fails it.
- **Decision** names the chosen option and states what was decided, in a few sentences, at the level that stays true while details change. No library names unless the decision is about that library and a story has proven it.
- **Consequences** states what follows, good and bad: what becomes easy, what becomes hard, what is now ruled out, and which checks enforce it.
- Names no person and tells no story of how the decision was reached.

## After writing

- Add a row to the index in `docs/adr/README.md`.
- Link the record from the rule it explains in `docs/architecture.md`.
- Re-read the record against the three tests and the table above. A record that fails one is deleted, not softened.

## Changing a decision

A record is Proposed while the story that proves it is open, and can be edited freely until then, even if it has already merged. The PR that merges that story sets it to `Accepted, YYYY-MM-DD`. An Accepted record is never edited. To change it, write a new record that supersedes it, set the old record's status to `Superseded by [N](NNNN-title.md)`, update the index, and repoint the rule in `docs/architecture.md`.
