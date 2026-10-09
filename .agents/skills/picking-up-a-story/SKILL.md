---
name: picking-up-a-story
description: Start a story the builder has agreed, in a fresh session, with a draft pull request opened at the first commit. Use when the builder asks to pick up a story issue.
---

# Picking up a story

## Only a story that carries `ready`

The `ready` label is the builder's agreement, made after reading the draft. A story without it is not built: say so, and say that the builder agrees it by adding the label. Do not start any work on it, and do not add the label yourself.

## Start it

1. Read the story and its epic, `docs/architecture.md`, and the decision records it touches.
2. Branch from an up-to-date `main`, named `<issue number>-<story title in kebab-case>`.
3. Make the first commit — the first piece of the story that stands on its own — push the branch, and open the pull request as a draft with `gh pr create --draft`.
   - Title: the story's title.
   - Body: [the pull request template](../../../.github/pull_request_template.md), with `Closes #<issue number>`.
   - From this commit on, the pull request body carries the progress and every call the story left open, so the builder can read the work without asking for it.

One story per pull request. Never push to `main`.

## While building

- Never edit the story. It is the record of what the builder agreed. When the story is wrong or silent, record the call in the pull request's `Decisions` section — including architecture decisions, and anywhere the code drifts from `docs/architecture.md`.
- Keep the acceptance criteria table current: one row per criterion and per edge, its test, and a link to where the test ran. Every edge the story lists has a test.
- Keep the progress list current, so the body reads as the state of the work.
- Re-read [the agents' guide](../../../AGENTS.md) before finishing: the definition of done holds for every pull request, and the `Learned` and `For review` sections are part of done, not commentary.

Leave the pull request in draft until the builder un-drafts it or asks for review.
