# Testing

**Audience:** anyone writing or moving a test.
**Purpose:** where a test goes, what it is named, what runs it, and how a scenario's approved file is kept.

- **A test sits beside the code it tests**, as `<name>.test.ts`, and runs in Vitest: `piece.test.ts` beside `piece.ts`, and `do.test.ts` beside `do`.
- **Browser specs of the built app are in `e2e/`**, as `<name>.spec.ts`, and run in Playwright ([ADR 7](../adr/0007-playwright-for-browser-specs.md)). They drive the whole app, so no one file is theirs.
- **The folder decides the runner**: Playwright runs only `e2e/` (`playwright.config.ts`), and Vitest runs every `*.test.*` and `*.spec.*` outside it, by [its default include](https://vitest.dev/config/include) with `e2e/` excluded in `vite.config.ts`, so a test named either way runs somewhere.
- `./do test` runs the tests, `./do e2e` the browser specs, and `./do check` every local check, the tests and the specs among them. What the checks are is `scripts/check`, which is what `./do` lists.

## Approved scenarios

- **A scenario test prints the story's scenarios and checks them against an approved file**: the steps in `src/test-helpers/scenario.ts` print the rule, a heading per behaviour and the Given/When/Then lines, and `expectApproved` compares them with an approved file beside the test, named after the test file and the test's full name: `approved.test.ts`'s test "approved files > the harness approves its own scenarios" has `approved.approved-files-the-harness-approves-its-own-scenarios.approved.md`.
- **Each step is a helper named after the phrase it prints, which runs that step**: `theTestsRun` prints "When the tests run" and runs them. No line of an approved file is typed by hand. `src/test-helpers/approved.test.ts` is the example.
- **Only `./do approve <test file>` writes approved files.** The agent writing the code runs it, and only for scenarios the builder agreed in the story, so the approved file reads as the story did. A pull request lists every approved file it changes.
- **Two limits to work around**: test names that differ only in case or punctuation share a file, so name them apart; and a renamed test leaves its old file behind, so delete it in the same change. The first real use case ([#20](https://github.com/yearofthedan/working-title/issues/20)) may reshape the format.
