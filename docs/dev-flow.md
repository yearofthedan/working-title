# Dev flow

**Audience:** the builder.
**Purpose:** how a story is written, agreed and implemented. The agent's side of each step is a skill in `.agents/skills/`.

## Write a story

A story is one thin slice of an epic, landing as pull requests.

1. **Pick the line.** Take a line of an epic's `Is` list that no story delivers yet.
2. **Ask for the story.** An agent drafts it in the story template and shows you the draft before filing anything: the [writing-stories skill](../.agents/skills/writing-stories/SKILL.md).
3. **Argue with it.** The draft is yours. It is the acceptance criteria you will be held to later, and it is cheapest to change now.
4. **File it** under its epic, in the epic's milestone.

## Agree it

Adding the `ready` label is the agreement. Until you add it, nothing is built: an agent asked to implement the story says so and stops.

## Have it implemented

In a fresh session, run `/skill:implement <issue number>`, or ask the agent to pick up, resume or carry on with it. The [implement skill](../.agents/skills/implement/SKILL.md) is what the agent works to. From there it:

- proposes the story's pull requests, and posts them on the issue as a checklist once you confirm;
- works one line at a time, each in its own draft pull request, `Part of #<issue number>` for the earlier ones and `Closes #<issue number>` for the one that finishes;
- resumes from an open pull request in a new session, so a lost context does not lose the work;
- hands each pull request over reviewed before you read it, and tickets work it finds outside the story instead of building it;
- lands each change with the issue number on the title and on the commits, squash-merged, naming in the body who wrote it: [commits and merges](standards/commits.md).

## Set up a machine

Run `pnpm install` in a fresh clone; it also installs the pre-commit hook. Run `./do setup` once per machine. It installs Ponytail, the skill the build work runs under, into your OMP.

`/skill:implement <issue number>` needs OMP's `skills.enableSkillCommands` setting on, which is its default. With it off, ask the agent to pick up, resume or carry on with the story instead: the skill is model-invocable either way, so the wording reaches it.
