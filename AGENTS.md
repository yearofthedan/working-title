# Agents' guide

**Audience:** every agent working in this repo.
**Purpose:** tells an agent how work is done here, what done means, and where the rules live.

working-title is a local-first planning and drafting tool for novelists, built on Snowflake, extended.

## Always in context

How to write anything, from replies to commit messages, docs and PR bodies:

@docs/communication-standards.md

The words to use in code, tests, scenarios and UI:

@docs/ubiquitous-language.md

## Read before changing code

- [docs/architecture.md](docs/architecture.md): the shape of the system, its parts and constraints, and the quality targets.
- [docs/adr/](docs/adr/README.md): why each architecture decision was made. Read the record before changing what it decided.

## How work is done

@docs/dev-flow.md

## Where docs go

- `docs/architecture.md`: the shape of the system.
- `docs/adr/`: why, one record per decision; never edited once Accepted, superseded by a new record.
- `docs/explainers/<topic>.md`: how something tricky works, linked from the doc or code it explains. Written when a PR's Learned section calls for one.
- Code comments: anything local to one function.

File names are lowercase kebab-case. The exceptions are names a tool looks for: `AGENTS.md`, `README.md` and `SKILL.md`.

Every file in `docs/` opens with its audience and purpose. The exception is `docs/communication-standards.md`: a verbatim copy of [agent-standards/communication-standards.md](https://github.com/yearofthedan/snippets/blob/main/agent-standards/communication-standards.md), updated only by copying a newer version.
