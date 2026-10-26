Part of #

<!-- `Part of #<issue number>` for a pull request that is not the last planned pull request of the story's plan; on the one that finishes it, write `Closes #<issue number>` instead. -->

Written with: main session — <!-- tool, model -->; execution agent — <!-- model, or none -->; pull request review — <!-- model -->; live reviewers — <!-- models, or none -->. <!-- see docs/standards/commits.md -->

## Brief

<!-- What the execution agent builds from, each part written for an agent that saw none of the conversation: the acceptance criteria or Done when lines this pull request covers, the approach the builder confirmed, the files it starts from, the interface it changes, and where each test lands. -->

## Before / After

Before:

After:

## How to verify

<!-- Numbered steps the builder follows to check the change, starting from the running result rather than the tests: what to run, where to look, and what they should see. A change the writer sees starts with `./do preview` in the worktree, then clearing the site's data (DevTools → Application → Storage → Clear site data) and reloading, so the page is this build with a new project. The checks to run come last. -->

1.

## Acceptance criteria

<!-- Each acceptance criterion and edge from the story, or each Done when line from the task, the test or docs link that checks it, and where it was seen to fail and pass: a CI link, or the local run described. -->

| Acceptance criterion | Test | Run |
| --- | --- | --- |
|  |  |  |

## Decisions

<!-- Calls the story left open that were made while building, including architecture decisions and anywhere the code has drifted from docs/architecture.md. -->

## Learned

<!-- What would have saved time, or caught a mistake sooner? Each one is also captured as an incident, as the [lessons skill](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/skills/lessons/SKILL.md) says. -->

## For review

- [ ] Approved files changed in this PR are listed here for review:
- [ ] docs/architecture.md and an ADR in docs/adr/ are updated, or the architecture didn't change
- [ ] docs/domain/ubiquitous-language.md has every new term used in scenarios or the UI, or none was added
