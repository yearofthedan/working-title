---
name: slice
description: Pick up the next task — if it needs a spec, create one first; if it has a spec, implement it. The default entry point for getting work done.
metadata:
  internal: true
---

# Slice Workflow

## Agent model

Steps 1-2 and 4-9 run in the main conversation (interactive spec and review work). Step 3 dispatches ACs to `execution-agent` (defined in `.claude/agents/`), grouped by neighbourhood — ACs that touch the same files go in one call.

---

1. **Find the task.** Read `docs/handoff.md` — identify the first task by priority. Do not skip items or search `docs/specs/` for existing specs; the first item in the queue is the task, whatever its state.
   - **Has a spec link** → go to step 2.
   - **`[needs design]` (no spec)** → switch to the `/spec` workflow: create a spec file from the appropriate template, walk through ACs with the user, update handoff.md with the spec link. After the spec is created, **commit the spec file and updated handoff.md** with message `docs(specs): add spec for [short-title]`. Do not begin implementation with an uncommitted spec. Then continue to step 2.
   - **`[chore]` (unambiguous, no spec)** → implement directly; skip the review depth of step 4 if trivial.

2. **Read the spec.** Open the linked spec file. Confirm the task and its ACs with the user BEFORE writing any code.

3. **Resolve open decisions and implement.** Capture the current HEAD first: `git rev-parse HEAD` → store as `<baseline-sha>` (needed for step 4). Then check the spec for an `## Open decisions` section or any language deferring implementation choices ("the executor should choose", "either approach works"). These are architectural forks that must be resolved before dispatching.

   For each unresolved decision:
   - Read the relevant source files to understand the current architecture and how the feature/canvas boundaries are drawn
   - Evaluate the approaches against the project's existing patterns (DDD, feature isolation — see `docs/architecture.md`)
   - If the user is in the loop, present the tradeoffs and get their call; if autonomous, prioritise correctness over convenience

   **Document the decision** in the spec file: replace the open question with the chosen approach, the reasoning, and the consequences. This becomes the implementation instruction. Never forward an unresolved architectural fork to the execution agent — it's optimised for mechanical changes, not design judgment.

   **Changes: group ACs by neighbourhood.** ACs that modify the same area (same feature directory, same component+test pair, same composable) go in one dispatch. ACs in a different area start a new dispatch.

   For each batch, dispatch one `execution-agent` call with:
   - The spec file path
   - Which ACs to implement (quote the AC text for each)
   - Explicit instruction: "Use `/implementation-context` before writing code. Implement each AC in order — write failing tests, implement, run `./do check`, commit, then move to the next AC. Stop after the last AC in this batch. Do not reference AC numbers, spec slugs, or task identifiers in code or comments — describe behaviour, not the changeset. Only add a comment when the code cannot speak for itself."
   - Any context from previous batches (files created, patterns established)

   Each AC still gets its own commit. The agent reads the neighbourhood once and carries context across ACs in the batch.

   **Bugs: dispatch the fix as a single unit.** Bug specs have a Fix section (not ACs) and verification in Done-when. Dispatch one `execution-agent` call: "Apply the fix in the Fix section. Write a regression test for the reproduction case. Verify Done-when. Run `./do check`, commit, then stop."

   After each batch:
   - Read the agent's notes file from `.claude/agent-notes/` — it logs deviations, assumptions, and surprises
   - If it reported assumptions or spec mismatches, decide whether to adjust the next batch, fix something, or ask the user
   - Verify commits exist and `./do check` passes before dispatching the next batch

4. **Run `/review-changes <baseline-sha>..HEAD` on the implementation.** Reviews only this task's commits. Apply fixes and commit before moving on. Skip for trivial `[chore]` tasks only.

5. **Complete the spec's Done-when checklist.** Walk through every item (defined by the template — `docs/specs/templates/change.md` or `bug.md`). Additionally:
   - [ ] **Standards check.** For every component/composable you extended, ask whether it's now doing too much; extract per `docs/guides/vue-composables.md` if so. This catches implementation-time bloat — do NOT defer it.
   - [ ] **A11y / Storybook.** If the UI changed, `./do test-a11y` passes and stories cover new states.
   - [ ] **Remove** the handoff.md task entry entirely — handoff.md is a work queue, not a history. Just delete the line. Update "Current state" if layout/test counts changed.
   - [ ] If a public surface changed, update the corresponding docs (the spec's Done-when specifies which).

6. **Archive the spec with reflection.** Move the spec from `docs/specs/` to `docs/specs/archive/`. Append an `## Outcome` section with:
   - **Reflection:** What went well? What didn't? What took longer than it should have? What would you tell the next agent on related work?
   - Actual test count added
   - Any architectural decisions or discoveries worth preserving

   **Do NOT proceed to step 7 until the Outcome section — including the Reflection — is written.**

7. **Capture non-obvious gotchas** discovered during implementation in the relevant `docs/guides/` doc, or `.claude/MEMORY.md` if cross-cutting. Add a code comment if the gotcha is visible at the call site.

8. **Commit** docs changes with a conventional commit message (see `CLAUDE.md`).

9. Do NOT proceed to the next slice without explicit user approval.
