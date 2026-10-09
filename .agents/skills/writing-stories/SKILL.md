---
name: writing-stories
description: Write a story for a line of an epic, check it holds up, and show it to the builder before filing it. Use when the builder asks for a story, or when an epic has a line no story delivers.
---

# Writing stories

A story is a thin slice the writer can use on its own, landing as one pull request. It is drafted in the [story template](../../../.github/ISSUE_TEMPLATE/story.md), and the builder agrees it by adding the `ready` label. Until then it is not built.

## Start from the epic line

A story exists to make one line of its epic's `Is` list true. Take the line, or the part of a line, that no story delivers yet, and quote it under `Delivers`. If you cannot name the line, there is nothing to write yet: ask which epic the story belongs to.

A story that makes a line true only in part quotes that part, and the rest of the line stays open for a later story.

Then fill the template:

- **Outcome** says who wants it and what changes for them, in the writer's words. If it cannot be said in one sentence, the slice is too big.
- **Acceptance criteria** carry the rule the story is built to, one `Rule:` line, and the scenarios that illustrate it.
  - Scenarios are Given/When/Then in the [ubiquitous language](../../../docs/ubiquitous-language.md), titled with the behaviour, each ending in the `Then` the writer would see. One per outcome the writer would see differently.
  - Edges are cases where the code could break but the writer sees nothing new. Names only; each one gets a test in the PR.
  - Anything that is not behaviour (speed, durability, a check in CI) is one line with its threshold and the test that measures it.
- **Is not** names the near misses a reader might expect here, each pointing at the story or epic where it lives.
- **Pointers** link the [architecture](../../../docs/architecture.md) sections the story touches.

## Check the draft before showing it

**Every rule has a basis today.** A rule that only holds once something a later story creates exists — a CI check before CI exists, a snapshot approval before there is a snapshot harness — belongs to that later story. Move it to that story's `Delivers` and name it here under `Is not`. A story's acceptance criteria are things this pull request can be judged against.

**One rule per story.** If the draft needs two `Rule:` lines, it is two stories: propose both, each valuable on its own. Keep one story only when neither half is worth shipping alone, and say so in the draft.

## Show it, then file it

Show the draft to the builder, in the conversation, before it exists as an issue. It is their story; the point of the draft is to be argued with.

When they agree, file it with `gh issue create` from the template, add it as a sub-issue of its epic, and put it in the epic's milestone. Never file it first and describe it after.

Agreement is theirs to give: add no `ready` label yourself, and start nothing until they do.

## Once it is agreed

A story is never edited by the agent once coding starts; it is the record of what was agreed. A call the story left open goes in the pull request's `Decisions` section instead. A change of scope goes back to the builder, who updates the story.
