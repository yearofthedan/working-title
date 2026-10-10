---
name: writing-stories
description: Use when drafting a story from an epic line: write it in the story template, check it holds up, and show it to the builder before filing it.
---

# Writing stories

A story is drafted in the [story template](../../../.github/ISSUE_TEMPLATE/story.md), and the builder agrees it by adding the `ready` label. Until then it is not built.

## Start from the epic line

A story exists to make one line of its epic's `Is` list true. Take the line, or the part of a line, that no story delivers yet, and quote it under `Delivers`. If you cannot name the line, there is nothing to write yet: ask which epic the story belongs to.

A story that makes a line true only in part quotes that part, and the rest of the line stays open for a later story.

Fill the rest of the template as its own comments say: they are the authority on each section. What this skill decides is which line the story carries, and that the draft passes the checks below.

## Check the draft before showing it

**Every rule has a basis today.** A rule that only holds once something a later story creates exists — a CI check before CI exists, a snapshot approval before there is a snapshot harness — belongs to that later story. Move it to that story's `Delivers` and name it here under `Is not`. A story's acceptance criteria are things this pull request can be judged against.

**One rule per story.** Count rules, not sentences: a `Rule:` that joins behaviours the writer would see separately — an `and` between things that could ship on their own — is two rules written as one sentence. Two rules mean two stories: propose both, each valuable on its own. Keep one story only when neither half is worth shipping alone, and say so in the draft.

## Show it, then file it

Show the draft to the builder, in the conversation, before it exists as an issue. It is their story; the point of the draft is to be argued with.

When they agree, file it with `gh issue create` from the template, add it as a sub-issue of its epic, and put it in the epic's milestone. Never file it first and describe it after.

Agreement is theirs to give: add no `ready` label yourself, and start nothing until they do.

## Once it is agreed

A story is never edited by the agent once coding starts; it is the record of what was agreed. A call the story left open goes in the pull request's `Decisions` section instead. A change of scope goes back to the builder, who updates the story.
