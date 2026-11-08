# Docs

**Audience:** anyone looking for a page, or deciding where a new one goes.
**Purpose:** what each page and folder is for, and where each kind of content lives.

## In `docs/`

| Page or folder | What it is for |
| --- | --- |
| [product.md](product.md) | What the product is for, and the design principles that decide calls no story or epic covers |
| [domain/](domain/) | The writer's world: the [ubiquitous language](domain/ubiquitous-language.md), and each method's design, whose built part is in `src/methods/` |
| [architecture.md](architecture.md) | The shape of the system: its parts, constraints and quality targets |
| [adr/](adr/README.md) | Why each architecture decision was made, one record per decision. An Accepted record is never edited; a new record supersedes it |
| [standards/](standards/README.md) | The conventions a change has to satisfy, one page per subject |
| [dev-flow.md](dev-flow.md) | The builder's page for writing, agreeing and implementing a story |
| `explainers/<topic>.md` | How something tricky works, linked from the doc or code it explains. Written when a pull request's Learned section calls for one |

A page here opens the way [`./do check-docs`](../scripts/check-docs) says.

## Outside `docs/`

| Where | What goes there |
| --- | --- |
| [AGENTS.md](../AGENTS.md) | What an agent has in context at session start, and where the rest lives |
| [.omp/RULES.md](../.omp/RULES.md) | A rule that has to hold on every turn. OMP sends it in full with every request, and task subagents do not receive `AGENTS.md`, so a rule that has to outlast a long session or reach a subagent goes here ([OMP's context files](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md), "Sticky rules vs normal context") |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | The commands that check and hand over a change |
| [.agents/skills/](../.agents/skills) | How an agent does a repeated job in this repo |
| The [dev-skills plugin](https://github.com/yearofthedan/snippets/tree/main/plugins/dev-skills) | A rule or skill shared with the builder's other projects. It is changed there, and this repo keeps no copy |
| Code comments | Anything local to one function |
