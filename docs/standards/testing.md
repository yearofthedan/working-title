# Testing

**Audience:** anyone writing or moving a test.
**Purpose:** where a test goes, what it is named, and what runs it.

- **A test sits beside the code it tests**, as `<name>.test.ts`, and runs in Vitest: `piece.test.ts` beside `piece.ts`, and `do.test.ts` beside `do`.
- **Browser specs of the built app are in `e2e/`**, as `<name>.spec.ts`, and run in Playwright ([ADR 7](../adr/0007-playwright-for-browser-specs.md)). They drive the whole app, so no one file is theirs.
- **The folder decides the runner**: Playwright runs only `e2e/` (`playwright.config.ts`), and Vitest runs every `*.test.*` and `*.spec.*` outside it, by [its default include](https://vitest.dev/config/include) with `e2e/` excluded in `vite.config.ts`, so a test named either way runs somewhere.
- `./do test` runs the tests, `./do e2e` the browser specs, and `./do check` every local check, the tests and the specs among them. What the checks are is `scripts/check`, which is what `./do` lists.
