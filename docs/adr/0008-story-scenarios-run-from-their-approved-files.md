# 8. Story scenarios run from their approved files

Status: Proposed, 2026-10-11

## Context

How are the tests that show what the writer sees written, run and reviewed?

- **Agent-written tests.** Agents write most of the tests here, and the pattern this follows exists because reviewing many of them does not scale: an assertion can be weak and still read as thorough.
- **Two runners.** A behaviour within one page runs in Vitest browser mode; a journey through the built app runs in Playwright ([ADR 7](0007-playwright-for-browser-specs.md)).
- **The agreed text.** A story's acceptance criteria are agreed in its issue before any code, and the tests have to read as that text rather than drift from it.
- **Review cost.** A change is reviewed by reading a diff, so what a test asserts should appear in a file the reviewer scans, not only in code.
- **One author, no backend.** One writer on one device ([ADR 1](0001-no-backend-in-v1.md)), so nothing here may rely on a server.

## Options considered

| Option | Agent-written tests | Two runners | The agreed text | Review cost |
| --- | --- | --- | --- | --- |
| Scenario files, played and approved | The runner's assertions are written once; a case is a file diff | One format, and each runner hands back the same printed tree | The rule and scenarios are copied from the issue, and the file is refused unless it reads as it prints | A behaviour change is a few lines of diff in the file |
| Hand-written tests against a printed scenario | Each case hand-writes its steps and its assertions | Both, as the harness around it allowed | The scenario is printed to an approved file, but the assertions sit beside it | A weak assertion can be added without the file changing |
| Gherkin with a shared step library | Steps are reused, so a case is short | Both, with a step binding each | Reads as prose, and drifts from the issue unless the two are kept in step | A change in wording hides a change in behaviour |

## Decision

A story's scenarios live in a file, copied from the issue: a `Rule:` line, per scenario a heading and one fenced block holding its steps and, after them, the tree the runner printed. The runner plays each step against a part of the writer driver over a narrow scope type of our own — so a part finds a field by the label a writer reads, never through `Page` — and compares the page with what the file records, refusing a difference as lines. Only `./do approve <file>` replaces a recorded block, choosing the runner by where the file is, and each runner writes through its own side: Playwright from Node, Vitest browser mode through the server's write.

A page's behaviour runs in Vitest browser mode; a journey through the built app runs in Playwright, because a browser-mode test cannot be the page that reloads; a logic contract is a `describe`/`it` test beside its code.

The forces that decided it were the review cost and the agreed text: the pattern makes a weak assertion unwritable, because the file holds what was agreed and the runner holds the comparison. The Gherkin option lost on the drift between a fixed step library and the issue's own words; the hand-written option lost because its assertions are what a reviewer cannot see changing.

## Consequences

- Adding a case is a file diff, and a behaviour change shows as a line diff in that file.
- Both runners print one tree format, verified byte for byte for the same field.
- The tree normalises whitespace, so a facet's text as typed needs a value-level test: the storage round trip carries that, not the scenario file.
- A runner must be able to hand the tree back and to write the file it read; a runner that could only compare would force a second way to approve.
- Vitest browser mode needs Chromium installed, so `./do check` runs the specs before the tests on a fresh machine.
- The harness is checked by its own tests; the layer check keeps it from reaching into the domain.
