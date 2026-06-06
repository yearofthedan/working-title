# Durable memory

Git-tracked, cross-cutting rules and gotchas that must survive a container rebuild (`~/.claude/` does not). Add an entry when a slice/spec turns up something non-obvious that **isn't tied to one file** (those go in `docs/guides/` or a code comment) and **isn't already in the docs**. Keep each entry to the gotcha plus why it bites.

## Entries

### Commits run the full pre-commit gate, including e2e
`lint-staged` (via Husky `pre-commit`) runs `./do lint`, `./do build`, and **`./do e2e`** on every commit that stages any file, plus `./do test related` for `src/**`. So a commit can take minutes and will fail if Playwright browsers aren't installed (`./do bootstrap` / `pnpm exec playwright install`). Expect this; don't assume a hang.
