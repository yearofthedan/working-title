---
name: implement
description: Use to implement a ready story, task or bug across the pull requests its issue plans, handing each one over reviewed. Also use when the builder says pick up, resume or carry on, or asks for a pull request's review findings to be fixed.
---

# Implementing a story

Work comes from an issue that carries the `ready` label: a story, a task, or a bug. The label is the builder's agreement, made after they read the issue. Implement it across as many planned pull requests as it needs, and hand each one over reviewed.

Run as `/skill:implement N`.

## Which issue

With no issue number and no open pull request in the conversation, ask which story, task or bug before anything else. Do not infer one from the branch, the last commit, or the previous conversation.

## Not without `ready`

An issue without the label is not built: say so, say that the builder agrees it by adding `ready`, and stop. Do not start any work, and never add the label yourself.

## Plan the pull requests

A ready issue with no plan comment gets a plan before any code.

1. Read the issue, its epic, `docs/architecture.md` and the decision records it touches.
2. List the open questions the plan depends on: anything whose answer changes which pull requests the story takes, what they hold, or what a planned pull request will have to decide, such as what a tool, a library or the platform does, or whether an approach works on this repo. Answer each by probing outside the working tree: read the current docs and link them beside the finding, or make a short run in a temporary directory or a scratch clone, so the checkout stays as it was. A question no probe settles is listed as still open. A probe that turns into code the story would ship, such as a harness, a fixture or a script, stops there, and that code becomes an enabling pull request in the plan. A story with no open questions says so.
3. Work out the pull requests it takes. Each planned pull request is a thin slice that stands on its own, and each ends in something the builder can check. **Enabling pull requests come before the story's own pull request**: the ones that set up what the rest needs land first. Cut them so that as few as possible depend on an earlier one — one that needs only `main` can start while the one before it is still in review.
4. Propose them to the builder, numbered, each one an imperative phrase: its title becomes the pull request's title, and so the message the merge lands as. With them, set out each open question, what was probed, what it showed, what is still open, and which planned pull requests rest on it.
5. Do not post anything until they confirm. Then post them on the issue as a checklist comment, with the open questions and findings beneath it so a fresh session has them, and start the first unstarted one.

Tick a planned pull request off in that comment as its pull request merges. The last unticked one is the one whose pull request closes the issue.

## Start a planned pull request

- Branch from an up-to-date `main` in a worktree of its own, named `<issue number>-<the planned pull request's title, kebab-case>`: `git worktree add ../<branch> -b <branch> origin/main`, removed with `git worktree remove` once the planned pull request merges. Two planned pull requests of one issue are open at once, so the worktree is named after the planned pull request and not the issue. The main worktree is the builder's and other sessions', so a branch switch there moves their work, and the hook refuses one. A planned pull request that needs work still unmerged in another planned pull request branches from that one's branch, points its pull request at it, and retargets to `main` once that one merges — but that is the exception: ones that stand on `main` alone are preferred, so blocking on review stays rare.
- Run `pnpm install` in the worktree. It installs the git hooks, and a commit in a worktree without them is refused.
- Confirm the approach with the builder, as the next section says. Nothing is committed before they say yes.
- Make the first commit empty, its subject the pull request's title: `git commit --allow-empty -m '<issue number>: <title>' --trailer 'Agent-Model: <model>'`. Push the branch. Every commit names its model in an `Agent-Model:` trailer, as [commits and merges](../../../docs/standards/commits.md) says.
- Open the pull request as a draft, titled `<issue number>: <the planned pull request, as an imperative phrase>` — the title is the message the merge lands as, per [commits and merges](../../../docs/standards/commits.md) — with the [pull request template](../../../.github/pull_request_template.md) as its body and `Part of #<issue number>` at the top. Fill its `Brief` section: the acceptance criteria or `Done when` lines the change covers, the approach the builder confirmed, the files it touches, the interface it changes, and where each test lands, each written so the execution agent, which saw none of the conversation, can build from it alone.
- Dispatch the execution agent with the `task` tool: agent `execution-agent`, not isolated, its task naming the pull request's number, its branch, the worktree's absolute path, and the model it runs as, which `task.agentModelOverrides.execution-agent` sets ahead of the definition's own ([the task tool](omp://tools/task.md), "Flow", steps 7 and 11). The worktree path is named because a spawn that is not isolated runs in the main session's directory, and an isolated one hands its changes back as patches or a branch instead of pushing. For the same reason the agent gives its file tools absolute paths under the worktree: a relative one resolves against the main checkout.
- From that commit on, the body carries the progress and every call the issue left open, so the work reads itself out without being asked.
- Keep the acceptance criteria table current: one row for each criterion and each edge, or each `Done when` line of a task, its test or docs link, and where it ran.

The pull request that finishes the last unticked planned pull request says `Closes #<issue number>` where the others say `Part of`. The last one is known when the plan is made and again when the plan is updated, so a planned pull request that turns out to be last is opened, or edited, to close.

## Confirm the approach

Before a planned pull request's first commit, set out its approach, grouped by the classes below, each with what you propose, and wait for the builder's yes. The approach goes in a message of its own, and nothing is built while it is unanswered: work that assumes an answer is a guess, and a part of it left as a clause inside a status report is not asked. A planned pull request that needs nothing settled in any class says so, and still waits. The plan stays titles: the approach is set out one planned pull request at a time, when that one starts.

1. **Tooling and dependencies**, including a choice not to use one.
2. **Architecture**: anything that changes [`docs/architecture.md`](../../../docs/architecture.md).
3. **Decision records the planned pull request touches**: how it follows each one, and any you think is wrong for this case. A challenge names the record, what this planned pull request shows it missed, and what you would decide instead. A yes adds a superseding record to the plan, through the [writing-adrs skill](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/skills/writing-adrs/SKILL.md), ahead of the planned pull request that depends on it.
4. **Reading the issue**: how you read an acceptance criterion or a `Done when` line that allows more than one reading.
5. **Scope** beyond the planned pull request, including changing or removing existing behaviour.
6. **New domain terms**, for [`docs/ubiquitous-language.md`](../../../docs/ubiquitous-language.md).
7. **What the writer sees**: copy, interaction and layout.
8. **The shape of stored data**, and what happens to data already saved.
9. **Test strategy**: the level each case is tested at, and what is faked.

A part of the approach that comes up once the planned pull request is underway goes through the same gate: stop, propose it, and wait for the builder's yes before building further. Record each answer in the pull request's `Decisions`.

## When the execution agent returns

The execution agent keeps its notes at `.omp/agent-notes/<branch>.md` in its worktree. Read them and its answer, then:

- put each assumption it made and each change to the approach in the pull request's `Decisions`. One the builder has not confirmed goes to them first, through [Confirm the approach](#confirm-the-approach), before anything is built on it;
- put what would have saved time in `Learned`;
- draft each find outside the brief's scope as an issue, as [Work found outside the issue](#work-found-outside-the-issue) says, and file it on the builder's go;
- take a stop to the builder, in a message of its own, before anything is dispatched again.

## Resume

In a fresh session with an open pull request for the issue — still a draft, or already handed over — carry on from that pull request's body: the plan, the progress, the approach already confirmed, and the acceptance criteria table are there. Do not re-plan, and do not open a second pull request for one already started. When the pull request has been handed over and carries review findings, fix them the way Hand over says.

With no open pull request and earlier ones merged, tick them off in the plan comment and start the next unticked one. With no open pull request and nothing left to tick, the issue is finished: say so, and start nothing.

## Hand over

A pull request whose work is done is handed over, not left in draft. The main session runs every step below, dispatching the execution agent only for a finding step 2 sends back to it:

1. **Run the review** over the branch's diff against `main` — the whole change, not only the last commit. Run it yourself, as the `reviewer` agent, and hand it this brief, adding whatever this change makes particular:

   > Review this pull request's change, not the story behind it. Does the diff do what the body says? Do the body's claims hold against the tree? Do its links resolve? Does its prose break a rule the repository sets itself? Start from [the standards index](../../../docs/standards/README.md), which says where the rest of the rules are. Findings only, strongest first, each with its file and line, and no summary of the change. A story-level gap is an aside, not a finding.
   >
   > Check every claim the change rests on about how a tool, library or platform behaves — a default, a flag, an exit code, an output's shape — against the link or run beside it, and read that source yourself: a claim with neither is a finding. A stub in a test is such a claim: compare what it does with what the tool does, not with what the code under test expects.
   >
   > Where the pull request says `Closes #<issue number>`, audit the story too: every acceptance criterion and edge the issue lists against the evidence across the plan's pull requests, the plan comment against what merged, and every call the story left open. That is the only pull request where those questions have an answer, and the only one where they block.
2. **Fix each finding**, or record in the pull request's `Decisions` why it stays. The main session fixes a finding in prose, a link or a single line itself, with absolute paths under the worktree. One that needs new code, a test or a change across files goes back to the execution agent: add it to the `Brief` under `### Findings`, and dispatch again as [Start a planned pull request](#start-a-planned-pull-request) says.
3. **Fill `Learned`**: what would have saved time, or caught a mistake sooner?
   - Read [the lessons index](../../../docs/lessons.md) and update it: add this pull request to the **Found in** list of the lesson it is, or add a row when it is new. Then run `./do lessons` and drop the entries it names.
   - When the row says the lesson has recurred, propose a lesson pull request carrying the smallest fix — a check wherever a check can be written, a rule only where none can — and add it to the plan, ahead of the one that closes the issue, once the builder confirms.
4. **Fill the acceptance criteria table** and check the `For review` list: approved files listed, `docs/architecture.md` and an ADR updated or the architecture unchanged, and every new term in `docs/ubiquitous-language.md`.
5. **Mark the pull request ready for review with `./do ready <pr>`**, and fix each condition it names.

## Work found outside the issue

Work that belongs to a different issue — a bug in code this change does not touch, a missing check, a hole in a doc — is never built here. Draft the bug, story or task in its template, show the draft to the builder, and file it without `ready` once they confirm. Name the new issue in `Decisions`, and build none of it.

## Build rules

- Work comes from the issue. Its acceptance criteria were agreed before any code: build to them.
- Never edit the issue yourself once coding starts. When you disagree with it, or it left something open, propose the call as [Confirm the approach](#confirm-the-approach) says and record the builder's answer in the pull request's `Decisions`. A change of scope goes back to the builder, who updates the issue.
- A question or aside from the builder is [answered, not immediately acted on](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/rules/working-with-the-user.md): where it points at a change of scope or a call the plan did not make, ask for a direct yes before building it. Until it is answered, name it again at each hand-over; never drop it or settle it yourself.
- When something already written down fails [the relevance and placement check](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/rules/durable-writing.md), raise it with the builder rather than building on it or moving it yourself.
- Each planned pull request lands as one pull request. Pull requests go to `main` only through review, squash-merged. Never push to `main`.
- Every edge the issue lists needs a test in the pull request table.
- Re-read the definition of done below before handing over.

## Definition of done

A pull request is done when all of these hold:

- A change to the system's shape, parts or constraints comes with `docs/architecture.md` updated, and a decision record in `docs/adr/` when the [writing-adrs skill](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/skills/writing-adrs/SKILL.md) says it needs one.
- A new term used in code, scenarios or the UI is in `docs/ubiquitous-language.md`.
- The `Learned` section is filled and [the lessons index](../../../docs/lessons.md) updated: the lesson it names is a row with this pull request in its **Found in** list, and a lesson found twice inside the window has a proposed lesson pull request.
- Each case's test is written before its code, and seen to fail while every other case passes. A hook or rule the change adds is seen to fail on the case it catches. The run is linked from its row in the acceptance table, or described there when it ran locally and nothing it covers depends on the machine. A case is shown failing by breaking the code that should catch it, on committed work, and the file is read after the break is undone: a restore that quietly puts back the wrong version reads as a passing case, and as a flaky one later.
- A run counts as evidence only when its answer is not already written where it can read it: not in what it is handed, such as a pull request body; not in the files it reads, such as a probe's own text; and not in a harness beside it — stand-ins, their logs, other cases' inputs and answers — that it could find from its own directory or `PATH`.
- In a task, each `Done when` line has the evidence the [task template](../../../.github/ISSUE_TEMPLATE/task.md) asks for, and the cases above are only the lines it says are tested here.
- The pull request has been handed over: reviewed, findings fixed or answered, and marked ready.
