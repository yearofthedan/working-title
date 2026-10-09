# Dev flow

**Audience:** the builder and every agent working in this repo.
**Purpose:** how work is done, what done means, and the builder's steps for writing, agreeing and starting a story.

## How work is done

- Work comes from a story issue. Its acceptance criteria were agreed before any code: build to them.
- Never edit the story yourself once coding starts. When you disagree with it, or it left something open, record the call in the PR's Decisions section. A change of scope goes back to the story's owner, who updates the story.
- One story per PR. PRs go to `main` only through review, squash-merged. Never push to `main`.
- When a story's acceptance criteria list Edges, each one needs a test in the PR table.

## Writing, agreeing and starting a story

1. **Pick the line.** A story exists to make one line of its epic's `Is` list true. Take a line no story delivers yet.
2. **Ask for the story.** An agent drafts it in the story template and shows you the draft before filing anything. The [writing-stories skill](../.agents/skills/writing-stories/SKILL.md) is what it works to.
3. **Argue with it.** The draft is yours: it is the acceptance criteria you will be held to later, and it is cheapest to change now.
4. **Agree, or don't.** Adding the `ready` label is the agreement. A story without it is not built, and an agent asked to pick one up will say so and stop.
5. **Start it.** In a fresh session, ask an agent to pick the story up. It opens a draft PR linked to the story at its first commit, and keeps the progress and its calls in the PR body from then on. The [picking-up-a-story skill](../.agents/skills/picking-up-a-story/SKILL.md) is what it works to.

## Definition of done

A PR is done when all of these hold:

- A change to the system's shape, parts or constraints comes with `docs/architecture.md` updated, and a decision record in `docs/adr/` when the [writing-adrs skill](../.agents/skills/writing-adrs/SKILL.md) says it needs one.
- A new term used in code, scenarios or the UI is in `docs/ubiquitous-language.md`.
- The PR's Learned section is filled: what would have saved time, or caught a mistake sooner? A lesson that would recur gets its own PR with the smallest fix: a check first, a rule in this file or a skill second.

## Agent skills

The skills the build work runs to live in `.agents/skills/`, and OMP loads them from the repo:

| Skill | What it covers |
| --- | --- |
| [writing-stories](../.agents/skills/writing-stories/SKILL.md) | Drafting a story from an epic line, and the checks it passes before the builder sees it |
| [picking-up-a-story](../.agents/skills/picking-up-a-story/SKILL.md) | Starting an agreed story, and how its PR body is kept |
| [writing-adrs](../.agents/skills/writing-adrs/SKILL.md) | Whether a decision needs a record, and how to write one |

Ponytail, the skill that holds the build work to the smallest solution that works, is installed into your OMP rather than kept here: run `./do setup` once per machine.
