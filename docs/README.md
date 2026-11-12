# Docs

**Audience:** anyone looking for a page, or deciding where a new one goes.
**Purpose:** which page or folder holds each kind of content.

## In `docs/`

| Page or folder | Holds |
| --- | --- |
| [product.md](product.md) | What the product is for, and its design principles |
| [domain/](domain/) | The writer's world: the [ubiquitous language](domain/ubiquitous-language.md) and each method's design |
| [architecture.md](architecture.md) | The shape of the system |
| [project-structure.md](project-structure.md) | Where each folder and file suffix lives |
| [adr/](adr/README.md) | Why each architecture decision was made |
| [standards/](standards/README.md) | The conventions a change has to satisfy |
| [dev-flow.md](dev-flow.md) | The builder's page for writing, agreeing and implementing a story. The agent's side, with the build rules and the definition of done, is the plugin's [implement skill](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/skills/implement/SKILL.md) |

An explainer, for something tricky, goes in `docs/explainers/<topic>.md`, created with the first one and linked from the doc or code it explains.

A page here opens the way [`./do check-docs`](../scripts/check-docs) says.

## Outside `docs/`

| Where | Holds |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | What an agent has in context at session start |
| [.omp/RULES.md](../.omp/RULES.md) | A rule that must hold on every turn, subagents included: [OMP sends it with every request](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md) |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | The commands that check and hand over a change |
| [.agents/skills/](../.agents/skills) | How an agent does a repeated job in this repo |
| The [dev-skills plugin](https://github.com/yearofthedan/snippets/tree/main/plugins/dev-skills) | A rule or skill shared with the builder's other projects, changed there |
