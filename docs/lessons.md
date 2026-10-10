# Lessons

**Audience:** an agent handing a pull request over, and the builder deciding what to fix next.
**Purpose:** the lessons that keep recurring, how often each has been found, and what stops it.

A lesson is something that would have saved time, or caught a mistake sooner. Every pull request's `Learned` section names the lessons it met; this file indexes them across every story, so a repeat can be told from a new one without reading the `Learned` section of every merged pull request. The hand-over step in [the implement skill](../.agents/skills/implement/SKILL.md) says how a row is kept, and when a lesson pull request is proposed.

A row is a lesson that could come back. A one-off fact — a command that exits non-zero, an API's shape — stays in the `Learned` section that named it.

| Lesson | First named | Times found | Tripwire |
| --- | --- | --- | --- |
| Tool behaviour is checked against the current docs before it is stated as fact, in a story or in a claim about what a platform can do | [#22](https://github.com/yearofthedan/working-title/pull/22) | 2 | a rule in AGENTS.md: what you assert |
| Every deliverable is checked for a basis today when a story is written | [#24](https://github.com/yearofthedan/working-title/pull/24) | 1 | none |
| A run is only evidence if the answer is not already written where the run can read it | [#25](https://github.com/yearofthedan/working-title/pull/25) | 1 | none |
| A rule written as one sentence can still be two rules | [#25](https://github.com/yearofthedan/working-title/pull/25) | 1 | none |
| A worktree does not contain a child session: it shares `.git` — the hooks, the remote, the credentials | [#27](https://github.com/yearofthedan/working-title/pull/27) | 1 | none |
| Resume makes a pull request's body an input, not only a record | [#27](https://github.com/yearofthedan/working-title/pull/27) | 1 | none |

## The columns

- **First named** links the pull request whose `Learned` section named the lesson first. A later pull request meeting it again does not move it.
- **Times found** counts the pull requests that have named it, the first one included. It is evidence, not a control: the count is what said #22's lesson had come back, and a count that keeps climbing with a tripwire in place is its own lesson — the tripwire is not working.
- **Tripwire** is what stops the lesson. It is `none` until the lesson is found a second time, because one meeting is not evidence that it recurs; `proposed` once a lesson pull request is proposed; and then the tripwire itself once that lands — a check wherever a check can be written, and a rule only where none can.

A row is never removed. A lesson with a tripwire is the file working, not a finished task: the count is what shows whether the tripwire holds, and a row deleted on resolution would let the same lesson come back looking new — at 1, needing a second meeting before anything could be proposed.
