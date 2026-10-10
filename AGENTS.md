# Agents' guide

**Audience:** every agent working in this repo.
**Purpose:** tells an agent what is always in context here, and where the rest of the rules live.

working-title is a local-first planning and drafting tool for novelists, built on Snowflake, extended.

## Always in context

How to write anything, from replies to commit messages, docs and PR bodies:

@docs/standards/communication-standards.md

The words to use in code, tests, scenarios and UI:

@docs/ubiquitous-language.md

## Read before writing a story or making a call

- [docs/product.md](docs/product.md): what the product is for, and the design principles that decide calls no story or epic covers.

## Read before changing code

- [docs/architecture.md](docs/architecture.md): the shape of the system, its parts and constraints, and the quality targets.
- [docs/adr/](docs/adr/README.md): why each architecture decision was made. Read the record before changing what it decided.

## How work lands

- Never push to `main`: a change reaches it the way [commits and merges](docs/standards/commits.md) sets out.
- Work comes from an issue whose acceptance criteria were agreed before any code. Never edit an agreed issue to fit what was built: a change of scope goes back to its owner.

How a story is planned, built and handed over is in the skills below, which is where the build rules and the definition of done live.

## What you assert

Check what a tool, a platform or a library does against its current docs before writing it down as a fact — in a story, a rule, a comment, a commit or a reply — and link the doc beside the claim. A search that finds nothing is not the docs.

## Where docs go

- `docs/product.md`: what the product is for, and its design principles.
- `docs/architecture.md`: the shape of the system.
- `docs/adr/`: why, one record per decision; never edited once Accepted, superseded by a new record.
- `docs/dev-flow.md`: the builder's page for writing, agreeing and implementing a story.
- `docs/lessons.md`: the lessons still in play, where each one was found, and what stops it.
- `docs/standards/`: the conventions a change has to satisfy, one page per subject, [listed here](docs/standards/README.md).
- `.agents/skills/<name>/SKILL.md`: how an agent does a repeated job.
- `docs/explainers/<topic>.md`: how something tricky works, linked from the doc or code it explains. Written when a PR's Learned section calls for one.
- Code comments: anything local to one function.

File names are lowercase kebab-case. The exceptions are names a tool looks for: `AGENTS.md`, `README.md` and `SKILL.md`.

Every file in `docs/` opens with its audience and purpose. The exceptions are the records in `docs/adr/`, which follow [the writing-adrs skill](.agents/skills/writing-adrs/SKILL.md)'s shape, and [docs/standards/communication-standards.md](docs/standards/communication-standards.md): a verbatim copy of [agent-standards/communication-standards.md](https://github.com/yearofthedan/snippets/blob/main/agent-standards/communication-standards.md), updated only by copying a newer version.
