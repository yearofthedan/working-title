# Dev flow

**Audience:** the builder.
**Purpose:** how a story is written and agreed. The agent's side of each step is a skill in `.agents/skills/`.

## Write a story

A story is one thin slice of an epic, landing as pull requests.

1. **Pick the line.** Take a line of an epic's `Is` list that no story delivers yet.
2. **Ask for the story.** An agent drafts it in the story template and shows you the draft before filing anything: the [writing-stories skill](../.agents/skills/writing-stories/SKILL.md).
3. **Argue with it.** The draft is yours. It is the acceptance criteria you will be held to later, and it is cheapest to change now.
4. **File it** under its epic, in the epic's milestone.

## Agree it

Adding the `ready` label is the agreement. Until you add it, nothing is built.

## Set up a machine

Run `./do setup` once per machine. It installs Ponytail, the skill the build work runs under, into your OMP.
