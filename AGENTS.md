# Agents' guide

**Audience:** every agent working in this repo.
**Purpose:** tells an agent what is always in context here, and where the rest of the rules live.

working-title is a local-first planning and drafting tool for novelists, built on Snowflake, extended.

## Always in context

How to write anything, from replies to commit messages, docs and PR bodies, and how to work with the builder, is in the [dev-skills plugin](https://github.com/yearofthedan/snippets/tree/main/plugins/dev-skills)'s rules, which `./do setup` installs. OMP loads each rule as its frontmatter says: most go to every session, and the one on working with the builder to the main session only ([OMP's rulebook matching](https://github.com/can1357/oh-my-pi/blob/main/docs/rulebook-matching-pipeline.md)).

The words to use in code, tests, scenarios and UI:

@docs/domain/ubiquitous-language.md

## Read before writing a story or making a call

- [docs/product.md](docs/product.md): what the product is for, and the design principles that decide calls no story or epic covers.
- [docs/domain/snowflake-extended.md](docs/domain/snowflake-extended.md): the built-in method's pieces, facets and stages, and the rules between them.

## Read before changing code

- [docs/architecture.md](docs/architecture.md): the shape of the system, its parts and constraints, and the quality targets.
- [docs/adr/](docs/adr/README.md): why each architecture decision was made. Read the record before changing what it decided.

## Running tasks

Once `pnpm install` has installed the dependencies, every task runs through `./do`, never the tools underneath: `./do` alone lists the tasks, each a file in `scripts/`. A new task is a new file there, never a script in `package.json`, which keeps only `prepare`: one file per task stays readable as tasks grow, where a `package.json` of scripts does not. A dependency is added with `./do add`, never `pnpm add`: it audits what the resolution brought in before anything is installed.

## How work lands

- Never push to `main`: a change reaches it the way [commits and merges](docs/standards/commits.md) sets out.

How a story is planned, built and handed over is in the skills below, which is where the build rules and the definition of done live.

## Where docs go

- `.omp/RULES.md`: the rules that hold on every turn. OMP sends it in full with every request and reads `AGENTS.md` once at session start, so a rule that has to outlast a long session or reach a subagent goes here (OMP's `context-files.md`, "Sticky rules vs normal context"; `system-prompt-customization.md`, "Inputs by session type").
- The [dev-skills plugin](https://github.com/yearofthedan/snippets/tree/main/plugins/dev-skills): a rule or skill shared with the builder's other projects. It is changed there, and this repo keeps no copy.
- `docs/product.md`: what the product is for, and its design principles.
- `docs/domain/`: the writer's world: the ubiquitous language, and each method's design, whose built part is in `src/methods/`.
- `docs/architecture.md`: the shape of the system.
- `docs/adr/`: why, one record per decision; never edited once Accepted, superseded by a new record.
- `docs/dev-flow.md`: the builder's page for writing, agreeing and implementing a story.
- `docs/standards/`: the conventions a change has to satisfy, one page per subject, [listed here](docs/standards/README.md).
- `.agents/skills/<name>/SKILL.md`: how an agent does a repeated job.
- `docs/explainers/<topic>.md`: how something tricky works, linked from the doc or code it explains. Written when a PR's Learned section calls for one.
- Code comments: anything local to one function.

A page in `docs/` opens the way [`./do check-docs`](scripts/check-docs) says.
