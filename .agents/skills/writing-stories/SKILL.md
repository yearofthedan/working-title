---
name: writing-stories
description: Use when drafting a story or a task from an epic line, or checking one filed but not yet agreed: pick the template, check the draft holds up, and show it to the builder before filing or changing it.
---

# Writing stories

A story is drafted in the [story template](../../../.github/ISSUE_TEMPLATE/story.md), and the builder agrees it by adding the `ready` label. Until then it is not built.

## Story or task

A story delivers observable value to the writer; a task does not. Ask what the writer would see change. When something would, the line is a story, and its scenarios are tested here. When nothing would, the line is a task, drafted in the [task template](../../../.github/ISSUE_TEMPLATE/task.md), even when this repo writes the code: a `./do` script, a check, a CI workflow, a package manager setting or a dependency.

Everything below applies to both, with `Done when` in a task where a story has its acceptance criteria.

## Start from the epic line

A story exists to make one line of its epic's `Is` list true. Take the line, or the part of a line, that no story delivers yet, and quote it under `Delivers`. If you cannot name the line, there is nothing to write yet: ask which epic the story belongs to.

How to quote the line, or the part of it this story makes true, is in the template's `Delivers` comment.

Fill the rest of the template as its own comments say: they are the authority on each section. What this skill decides is which line the story carries, and that the draft passes the checks below.

## Check the draft before showing it

**Every rule has a basis today.** A rule that only holds once something a later story creates exists — a CI check before CI exists, a snapshot approval before there is a snapshot harness — belongs to that later story. Move it to that story's `Delivers` and name it here under `Is not`. A story's acceptance criteria are things this pull request can be judged against.

**A named tool or place has a decision behind it.** A criterion that names a tool or a place — a test runner, a library, a folder — rests on a decision record or a standard that already says so. Where none does, the criterion states the need without the name, such as "runs as one browser spec".

**A call the build can make is left to it.** A choice every criterion holds under, whichever way it goes, such as an unnamed tool, is not asked of the builder while drafting: the draft says it is chosen while building, and the builder confirms it when the planned pull request starts.

**One rule per story.** Count rules, not sentences: a `Rule:` that joins behaviours the writer would see separately — an `and` between things that could ship on their own — is two rules written as one sentence. Two rules mean two stories: propose both, each valuable on its own. Keep one story only when neither half is worth shipping alone, or when both halves change the same files and reviewing them apart would cost more than it saves. Say which in the draft.

**Each scenario is checked against the recorded ones.** Before writing a scenario, read the scenario files [the testing standard](../../../docs/standards/testing.md#approved-scenarios) keeps, and say for each scenario which recorded one it restates, changes or adds to, or that it is new. A restated scenario is cut. One that adds to or changes a recorded behaviour is written as it will read in that behaviour's file, and a change to a recorded scenario is a change to existing behaviour, shown to the builder as one. A story that changes only how recorded scenarios look names their files, whose recorded trees change, as its criteria, with a screenshot for what no tree records.

## Check a draft already filed

A filed draft without the `ready` label gets the same checks, against the template's own comments and the checks above. Before calling something a gap, read how the agreed stories and tasks handle it: what they share is the convention, and a draft that follows it passes, unless a template comment says otherwise. Show each proposed change to the builder, and edit the issue once they agree.

## Show it, then file it

Show the draft to the builder, in the conversation, before it exists as an issue. It is their story; the point of the draft is to be argued with.

When they agree, file it with `gh issue create` from its template, add it as a sub-issue of its epic, and put it in the epic's milestone. Never file it first and describe it after.

Agreement is theirs to give: add no `ready` label yourself, and start nothing until they do.

## Once it is agreed

A story is never edited by the agent once coding starts; it is the record of what was agreed. A call the story left open goes in the pull request's `Decisions` section instead. A change of scope goes back to the builder, who updates the story.
