# Lessons

**Audience:** an agent handing a pull request over, and the builder deciding what to fix next.
**Purpose:** the lessons that keep recurring, how often each has been found, and what stops it.

A lesson is something that would have saved time, or caught a mistake sooner. Each pull request's `Learned` section names the lessons it met; this file indexes them across every story, so an agent can tell a repeat from a new one without reading the `Learned` section of every merged pull request.

A row is a lesson that could come back. A one-off fact — a command that exits non-zero, an API's shape — stays in the `Learned` section that named it.

| Lesson | First named | Times found | Tripwire |
| --- | --- | --- | --- |
| A run is only evidence if the answer is not already written where the run can read it | [#25](https://github.com/yearofthedan/working-title/pull/25) | 1 | none |
| A worktree does not contain a child session: it shares `.git` — the hooks, the remote, the credentials | [#27](https://github.com/yearofthedan/working-title/pull/27) | 1 | none |
| Read the platform's own docs before writing an issue about a capability being absent | [#27](https://github.com/yearofthedan/working-title/pull/27) | 1 | none |
| Resume makes a pull request's body an input, not only a record | [#27](https://github.com/yearofthedan/working-title/pull/27) | 1 | none |

## How it is used

At hand-over, an agent reads this file and then its own `Learned` section:

- a lesson that is already a row has its **Times found** raised;
- a lesson that is not gets a row, at 1, linking the pull request that named it;
- a lesson whose **Tripwire** is `none` and whose count has reached 2 is the queue for a lesson pull request: the smallest fix, a check first, then a rule in AGENTS.md or a skill. It joins the story's plan once the builder confirms;
- when a lesson is stopped, its **Tripwire** names what stops it. A row with a tripwire whose count keeps rising means the tripwire is not working, which is a lesson of its own.
