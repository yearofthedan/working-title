# Agents' guide

**For:** every agent working in this repo, at the start of every session.
**Holds:** how work is done here, the definition of done, and where the rules live. The communication standards and the glossary are imported below so they are always in context.
**Changes when:** the way work is done changes, or a PR's Learned section shows a lesson that would recur and a rule is the smallest fix.

working-title is a local-first planning and drafting tool for novelists, built on Snowflake, extended.

## Always in context

How to write anything, from replies to commit messages, docs and PR bodies:

@docs/communication-standards.md

The words to use in code, tests, scenarios and UI:

@docs/GLOSSARY.md

## Read before changing code

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): the standing rules, where code goes, the checks and how to test.
- [docs/adr/](docs/adr/README.md): why each rule was chosen. Read the record before changing its rule.
- The `index.ts` of every `shared/` and `test-helpers/` folder on your path: use an existing helper before writing one.

## How work is done

- Work comes from a story issue. Its acceptance criteria were agreed before any code: build to them.
- Never edit the story once coding starts. When you disagree with it, or it left something open, record the call in the PR's Decisions section.
- One story per PR. PRs go to `main` only through review, squash-merged. Never push to `main`.
- Approved scenarios are the behaviour spec. An `.approved.md` changes only alongside a stated behaviour change, and every changed approved file is listed in the PR for review.
- When a story's acceptance criteria list Edges, each one needs a test in the PR table.

## Definition of done

A PR is done when all of these hold:

- CI is green on the head commit: typecheck, lint, glossary check, duplication check, unit and scenario tests, every epic demo spec, speed and durability checks, CodeQL.
- Dan has read every approved file in the diff. His merge is the approval.
- A new or changed standing rule comes with `docs/ARCHITECTURE.md` updated and a decision record in `docs/adr/`.
- A new term used in code, scenarios or the UI is in `docs/GLOSSARY.md`.
- The PR's Learned section is filled: what would have saved time, or caught a mistake sooner? A lesson that would recur gets its own PR with the smallest fix: a check first, a rule in this file or a skill second.

## Where docs go

- `docs/ARCHITECTURE.md`: today's rules.
- `docs/adr/`: why, one record per decision; never edited once merged, superseded by a new record.
- `docs/explainers/<topic>.md`: how something tricky works, linked from the rule it explains. Written when a PR's Learned section calls for one.
- Code comments: anything local to one function.

Every file in `docs/` opens with who it is for, what it holds and when it changes. The exception is `docs/communication-standards.md`: a verbatim copy of [agent-standards/communication-standards.md](https://github.com/yearofthedan/snippets/blob/main/agent-standards/communication-standards.md), updated only by copying a newer version.
