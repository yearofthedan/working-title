# Coding

**Audience:** anyone writing or reviewing code here.
**Purpose:** the conventions code has to satisfy, beyond what the formatter and linter enforce.

## Comments

A comment is worth writing only when it says what the code cannot.

1. **Say why the code is this way**: a constraint, a platform fact, or a trade-off the code cannot show. When the why rests on what a tool does, link the doc beside it ([AGENTS.md: What you assert](../../AGENTS.md#what-you-assert)). `do.test.ts` says why a TypeScript test runs a shell suite.
2. **A behaviour or a convention gets a test first.** If a comment describes what the code does or a rule it follows, ask whether a test could say it instead, and write the test when one can. The offline spec fails if `woff2` leaves the precache, so the config line that adds it needs no comment. A convention every reader already knows, such as a leading `_` for private, needs no comment; where the code enforces it, as `./do` does for `scripts/_*`, the test covers the enforcement.
3. **Never restate a name.** A comment that repeats what a function, file, variable or test is called goes; if the name does not say enough, rename it.
4. **A rule for other files is not a comment.** It goes in a standard or a check, where someone breaking it will meet it.
5. **Remove a duplication before commenting on it.** Two places that must change together share one value, or a test holds them together where they cannot share one. The theme colour is one constant in `vite.config.ts`, read by the manifest and the `theme-color` meta. The manifest's background colour is CSS on one side and JSON on the other, so `e2e/manifest.spec.ts` checks it matches the page.
6. **Something temporary says what ends it.** A placeholder says until when, as `src/tokens.css` does. A known limit takes the form `shortcut: <the limit>, <when to upgrade>`, as the service worker's update policy in `vite.config.ts` does.
7. **A comment a tool reads follows the tool.** The first comment line of each task in `scripts/` is the summary `./do` lists.
8. **Short, true now.** A comment is a living doc ([communication standards](communication-standards.md)), so it holds no history. A why that outgrows a short paragraph goes in `docs/explainers/`, linked from the code.
