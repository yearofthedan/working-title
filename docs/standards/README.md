# Standards

**Audience:** anyone landing a change here, before they have to ask.
**Purpose:** the conventions a change has to satisfy, one page per subject.

What belongs here is a convention on an artefact you read: a commit, a pull request title or body, a file's name, the words in the UI. Each page says what to do, and links whatever backs it up.

What belongs elsewhere:

| It is | It goes in |
| --- | --- |
| How a session behaves — check a claim before asserting it, work only from an agreed issue | `.omp/RULES.md`, `AGENTS.md`, the skills and the [dev-skills plugin](https://github.com/yearofthedan/snippets/tree/main/plugins/dev-skills)'s rules, where it binds without being looked up |
| How to write anything, and when a comment has value | the [dev-skills plugin](https://github.com/yearofthedan/snippets/tree/main/plugins/dev-skills)'s rules, shared with the builder's other projects |
| What a machine enforces — a ruleset, a check | the check, whose message names the standard it enforces; the standard states the rule and names no check |

## Pages

- [Commits and merges](commits.md): the issue number on titles and on commits, a pull request and squash only, the model on each agent commit, and the body naming who wrote it in which role.
- [Markup](markup.md): what an element is, and what its name means to the writer hearing it.
- [Styles](styles.md): which CSS features a style may rely on.
- [Testing](testing.md): a test beside its code, browser specs in `e2e/`, what runs each, and approved scenarios.
