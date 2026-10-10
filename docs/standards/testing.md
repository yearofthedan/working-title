# Testing

**Audience:** anyone writing or moving a test.
**Purpose:** where a test goes, what it is named, and what runs it.

- **A test sits beside the code it tests**, as `<name>.test.ts`, and runs in Vitest: `piece.test.ts` beside `piece.ts`, and `do.test.ts` beside `do`.
- **Browser specs are in `e2e/`**, as `<name>.spec.ts`, and run in Playwright ([ADR 7](../adr/0007-playwright-for-browser-specs.md)). They drive the built app, so no one file is theirs.
- **The names keep the runners apart**: Vitest picks up `**/*.test.ts` (`vite.config.ts`), and Playwright only `e2e/` (`playwright.config.ts`).
- `./do test` runs the tests, `./do e2e` the browser specs, and `./do check` both.
