---
name: implement
description: Use to implement a ready story or bug across the pull requests its issue plans, handing each one over reviewed. Also use when the builder says pick up, resume or carry on, or asks for a pull request's review findings to be fixed.
---

# Implementing a story

Work comes from an issue that carries the `ready` label: a story, or a bug. The label is the builder's agreement, made after they read the issue. Implement it across as many pull requests as it needs, one plan line each, and hand each one over reviewed.

Run as `/skill:implement N`.

## Which issue

With no issue number and no open pull request in the conversation, ask which story or bug before anything else. Do not infer one from the branch, the last commit, or the previous conversation.

## Not without `ready`

An issue without the label is not built: say so, say that the builder agrees it by adding `ready`, and stop. Do not start any work, and never add the label yourself.

## Plan the pull requests

A ready issue with no plan comment gets a plan before any code.

1. Read the issue, its epic, `docs/architecture.md` and the decision records it touches.
2. Work out the pull requests it takes. Each line is a thin slice that stands on its own, and each ends in something the builder can check. **Enabling pull requests come before the story's own pull request**: the ones that set up what the rest needs land first. Cut the lines so that as few as possible depend on an earlier one — a line that needs only `main` can start while the line before it is still in review.
3. Propose the lines to the builder, numbered, one sentence each.
4. Do not post anything until they confirm. Then post the lines on the issue as a checklist comment, and start the first unstarted line.

Tick a line off in that comment as its pull request merges. The last unticked line is the one whose pull request closes the issue.

## Start a line

- Branch from an up-to-date `main`, named `<issue number>-<line, kebab-case>`. A line that needs work still unmerged in another line branches from that line's branch, points its pull request at it, and retargets to `main` once that line merges — but that is the exception: lines that stand on `main` alone are preferred, so blocking on review stays rare.
- Make the first commit: the first piece of the line that stands on its own. Push the branch.
- Open the pull request as a draft, titled with the line, with the [pull request template](../../../.github/pull_request_template.md) as its body and `Part of #<issue number>` at the top.
- From that commit on, the body carries the progress and every call the issue left open, so the work reads itself out without being asked.
- Keep the acceptance criteria table current: one row for each criterion and each edge, its test, and where it ran. Every edge the issue lists has a test.

The pull request that finishes the last unticked line says `Closes #<issue number>` where the others say `Part of`. The last line is known when the plan is made and again when the plan is updated, so a line that turns out to be last is opened, or edited, to close.

## Resume

In a fresh session with an open pull request for the issue — still a draft, or already handed over — carry on from that pull request's body: the plan, the progress, the calls already made, and the acceptance criteria table are there. Do not re-plan, and do not open a second pull request for the same line. When the pull request has been handed over and carries review findings, fix them the way Hand over says.

With no open pull request and earlier lines merged, tick them off in the plan comment and start the next unticked line. With no open pull request and nothing left to tick, the issue is finished: say so, and start nothing.

## Hand over

A pull request whose work is done is handed over, not left in draft:

1. **Run the review** over the branch's diff against `main` — the whole change, not only the last commit. The commands that do this — `/review`, ponytail's `/ponytail-review` — are typed by the person at the keyboard and expanded from prompt input, which an agent's output never re-enters, so run the review yourself, as the `reviewer` agent over the diff, rather than writing one.
2. **Fix each finding**, or record in the pull request's `Decisions` why it stays.
3. **Fill `Learned`**: what would have saved time, or caught a mistake sooner?
   - Look for the lesson before claiming it is new: read the `Learned` sections of recently merged pull requests across every story, not only this one's — `gh pr list --state merged --limit 20 --json number,body`. A lesson this pull request's `Learned` names that an earlier pull request's already named becomes a proposed lesson pull request carrying the smallest fix — a check first, then a rule in AGENTS.md or a skill. Add it to the plan, before the closing line, once the builder confirms.
4. **Fill the acceptance criteria table** and check the `For review` list: approved files listed, `docs/architecture.md` and an ADR updated or the architecture unchanged, and every new term in `docs/ubiquitous-language.md`.
5. **Mark the pull request ready for review.**

## Work found outside the issue

Work that belongs to a different issue — a bug in code this change does not touch, a missing check, a hole in a doc — is never built here. Draft the bug or story in its template, show the draft to the builder, and file it without `ready` once they confirm. Name the new issue in `Decisions`, and build none of it.

## Build rules

- Work comes from the issue. Its acceptance criteria were agreed before any code: build to them.
- Never edit the issue yourself once coding starts. When you disagree with it, or it left something open, record the call in the pull request's `Decisions`. A change of scope goes back to the builder, who updates the issue.
- One plan line per pull request. Pull requests go to `main` only through review, squash-merged. Never push to `main`.
- Every edge the issue lists needs a test in the pull request table.
- Re-read the definition of done below before handing over: it holds for every pull request.

## Definition of done

A pull request is done when all of these hold:

- A change to the system's shape, parts or constraints comes with `docs/architecture.md` updated, and a decision record in `docs/adr/` when the [writing-adrs skill](../writing-adrs/SKILL.md) says it needs one.
- A new term used in code, scenarios or the UI is in `docs/ubiquitous-language.md`.
- The `Learned` section is filled, and a lesson an earlier pull request's `Learned` already named has a proposed lesson pull request carrying the smallest fix.
- The pull request has been handed over: reviewed, findings fixed or answered, and marked ready.
