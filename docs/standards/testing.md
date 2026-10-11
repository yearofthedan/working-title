# Testing

**Audience:** anyone writing or moving a test.
**Purpose:** where a test goes, what it is named, what runs it, and how a scenario's approved file is kept.

- **A test sits beside the code it tests**, named after it: `piece.test.ts` beside `piece.ts`, `scripts/audit.test.sh` beside `scripts/audit`.
- **Browser specs of the built app are in `e2e/`**, as `<name>.spec.ts`, and run in Playwright ([ADR 7](../adr/0007-playwright-for-browser-specs.md)). They drive the whole app, so no one file is theirs.
- **A spec drives the app through the writer driver**, `e2e/writer.ts`: its `writer` fixture names what the writer does, in the [ubiquitous language](../ubiquitous-language.md), and holds every locator. The driver finds elements by role or label only, as the writer would. Lint fails a call to any element-finding API in `e2e/`, and in the driver anything but `getByRole` and `getByLabel`; `vite.config.test.ts` shows each case failing. Page's selector actions, such as `page.click('#id')`, are caught only on a variable named `page`, so the driver closes over `page` rather than holding `this.page`. An element found inside `page.evaluate`, where the rules cannot see it, is the driver's job too.
- **The folder decides the runner**: Playwright runs only `e2e/` (`playwright.config.ts`), and Vitest runs every `*.test.*` and `*.spec.*` outside it, by [its default include](https://vitest.dev/config/include) with `e2e/` excluded in `vite.config.ts`, so a test named either way runs somewhere.
- `./do test` runs the tests, `./do e2e` the browser specs, and `./do check` every local check, the tests and the specs among them. What the checks are is `scripts/check`, which is what `./do` lists.

## Approved scenarios

The harness comes from the [Approved Scenarios](https://lexler.github.io/augmented-coding-patterns/patterns/approved-scenarios/) pattern, a special case of [Constrained Tests](https://lexler.github.io/augmented-coding-patterns/patterns/constrained-tests/): an approval file holds the input and the expected output, the runner regenerates it from what it observes, the execution logic is written and validated once, and the format is a data file a parser reads rather than an API a test calls.

- **An approved file holds the scenario's wording, and not yet the output it observed.** `./do approve` regenerates it from the printed scenario, so a behaviour change that leaves the phrases identical leaves the diff empty. The pattern's file carries the observed result as well.
- **A scenario test prints the story's scenarios and checks them against an approved file**: the steps in `src/test-helpers/scenario.ts` print the rule, a heading per behaviour and the Given/When/Then lines, and `expectApproved` compares them with an approved file beside the test, named after the test file and the test's full name: `approved.test.ts`'s test "approved files > the harness approves its own scenarios" has `approved.approved-files-the-harness-approves-its-own-scenarios.approved.md`.
- **Each step is a helper named after the phrase it prints, which runs that step**: `theTestsRun` prints "When the tests run" and runs them. No line of an approved file is typed by hand. `src/test-helpers/approved.test.ts` is the example.
- **Only `./do approve <test file>` writes approved files.** The agent writing the code runs it, and only for scenarios the builder agreed in the story, so the approved file reads as the story did. A pull request lists every approved file it changes.
- **Two limits to work around**: test names that differ only in case or punctuation share a file, so name them apart; and a renamed test leaves its old file behind, so delete it in the same change.
