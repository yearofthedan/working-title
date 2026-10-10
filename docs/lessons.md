# Lessons

**Audience:** an agent handing a pull request over, and the builder deciding what to fix next.
**Purpose:** the lessons still in play, where each one was found, and what stops it.

A lesson is something that would have saved time, or caught a mistake sooner. Every pull request's `Learned` section names the lessons it met; this file indexes them, so a repeat can be told from a new one without reading the `Learned` section of every merged pull request.

| Lesson | Found in | Tripwire |
| --- | --- | --- |
| Tool behaviour is checked against the current docs before it is stated as fact, in a story or in a claim about what a platform can do | [#22](https://github.com/yearofthedan/working-title/pull/22), [#27](https://github.com/yearofthedan/working-title/pull/27), [#28](https://github.com/yearofthedan/working-title/pull/28) | [AGENTS.md: What you assert](../AGENTS.md#what-you-assert) |
| Every deliverable is checked for a basis today when a story is written | [#24](https://github.com/yearofthedan/working-title/pull/24), [#31](https://github.com/yearofthedan/working-title/pull/31) | [writing-stories: Check the draft](../.agents/skills/writing-stories/SKILL.md#check-the-draft-before-showing-it) |
| A run is only evidence if the answer is not already written where the run can read it | [#25](https://github.com/yearofthedan/working-title/pull/25) | none |
| A rule written as one sentence can still be two rules | [#25](https://github.com/yearofthedan/working-title/pull/25) | none |
| A worktree does not contain a child session: it shares `.git` — the hooks, the remote, the credentials | [#27](https://github.com/yearofthedan/working-title/pull/27) | none |
| Resume makes a pull request's body an input, not only a record | [#27](https://github.com/yearofthedan/working-title/pull/27) | none |
| An aside from the builder is information, not an instruction: nothing they asked for is ended or changed on the strength of one | [#28](https://github.com/yearofthedan/working-title/pull/28), [#29](https://github.com/yearofthedan/working-title/pull/29) | [implement: Build rules](../.agents/skills/implement/SKILL.md#build-rules) |
| A thing already written down — a doc, a comment, a decision — is checked for whether it should be that way, rather than followed because it is there | [#28](https://github.com/yearofthedan/working-title/pull/28), [#31](https://github.com/yearofthedan/working-title/pull/31) | [implement: Build rules](../.agents/skills/implement/SKILL.md#build-rules) |
| A decision record says why its option won and why each other one lost; its table alone can argue for another option | [#29](https://github.com/yearofthedan/working-title/pull/29) | [writing-adrs: Decision](../.agents/skills/writing-adrs/SKILL.md#the-record) |
| A test is evidence only once it has been seen to fail without the thing it checks | [#31](https://github.com/yearofthedan/working-title/pull/31) | none |
| A reply says done only for what a tool result has shown | [#31](https://github.com/yearofthedan/working-title/pull/31) | none |
| A comment says what the code cannot; a behaviour or a convention gets a test before it gets a comment | [#31](https://github.com/yearofthedan/working-title/pull/31) | [Coding standard: Comments](standards/coding.md#comments) |
| A closing keyword before an issue number closes the issue wherever it sits in a pull request's body, even inside a sentence about another pull request | [#31](https://github.com/yearofthedan/working-title/pull/31) | none |

## The columns

- **Lesson** — one line, saying what to do or what to know. A one-off fact stays in the `Learned` section that named it instead: a lesson is something that could come back.
- **Found in** — every pull request that has named the lesson, oldest first. Each entry is a link to the pull request, `[#12](https://github.com/yearofthedan/working-title/pull/12)`: `./do lessons` reads the number from the link, and an entry that names no pull request is reported rather than passed over. The list is the whole record: its length is how often the lesson has been found, and a list holding two entries inside the window is what has recurred, which is what proposes a lesson pull request. Rows are only merged when they say the same thing, and then the lists are joined with the older entries first.
- **Tripwire** — what stops the lesson. `none` until it is found twice inside the window, because one meeting is not evidence that it recurs; `proposed` once a lesson pull request is proposed; and then the tripwire itself once that lands, which is a check wherever a check can be written and a rule only where none can. A lesson met again with its tripwire already in place is a lesson of its own: the tripwire for that one did not stop it.

## The window

An entry older than the window comes off the list, and when a row's last entry comes off, the row goes. The window is a number of commits behind `main` — commits, not days, so a quiet stretch expires nothing and a busy one clears quickly — and `./do lessons` owns the number and prints the entries past it. An entry whose pull request is still open counts as current; one whose pull request was closed without merging comes off at once, since it can never age.
