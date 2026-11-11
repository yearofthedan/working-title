# Agents' guide

**Audience:** every agent working in this repo.
**Purpose:** tells an agent what is always in context here, and where the rest of the rules live.

working-title is a local-first planning and drafting tool for novelists, built on Snowflake, extended.

## Always in context

The words to use in code, tests, scenarios and UI:

@docs/domain/ubiquitous-language.md

## Read before writing a story or making a call

- [docs/product.md](docs/product.md): what the product is for, and the design principles that decide calls no story or epic covers.
- [docs/domain/snowflake-extended.md](docs/domain/snowflake-extended.md): the built-in method's pieces, facets and stages, and the rules between them.

## Read before changing code

- [docs/architecture.md](docs/architecture.md): the shape of the system, its parts and constraints, and the quality targets.
- [docs/project-structure.md](docs/project-structure.md): where each folder and file suffix lives.
- [docs/adr/](docs/adr/README.md): why each architecture decision was made. Read the record before changing what it decided.

## Running tasks

Every task runs through `./do`, never the tools underneath: `./do` alone lists them. A new task is a file in `scripts/`, never a `package.json` script. A dependency is added with `./do add`, never `pnpm add`: it audits what the resolution brought in first. [CONTRIBUTING](CONTRIBUTING.md) has the commands for checking and handing over a change.

weaver, whose skills `./do setup` installs into `.agents/skills/`, is a dev dependency and runs as `pnpm exec weaver …`: a bare `weaver` is on `PATH` only inside `./do`.

## How work lands

- Never push to `main`: a change reaches it the way [commits and merges](docs/standards/commits.md) sets out.

## Where docs go

[docs/README.md](docs/README.md) says what each page is for and where a new one goes.
