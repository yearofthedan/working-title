# Contributing

**Audience:** anyone landing a change here, human or agent.
**Purpose:** the commands that check and hand over a change, and where the conventions for one are written.

- **Set up.** `pnpm install` once per clone and once per worktree: it installs the git hooks. `./do setup` once per machine.
- **Check.** `./do check` runs every local check. [Testing](docs/standards/testing.md) says what runs each test.
- **Verify a change.** For a change the writer sees, run it as a writer gets it: `./do preview` in the worktree, then clear the site's data (DevTools → Application → Storage → Clear site data) and reload, so the page is this build with a new project. `./do screenshot` shoots the built app at the widths the look criteria name, into `screenshots/`. For any other change, `./do check` is the verification. Run `./do check` last either way.
- **Follow the standards.** [`docs/standards/README.md`](docs/standards/README.md) lists them; read the page that governs a file before writing it.
- **Commit and title.** [Commits and merges](docs/standards/commits.md).
- **Open the pull request** from [the template](.github/pull_request_template.md). `./do ready <pr>` marks it ready and names each condition it fails; `./do ready --check <pr>` re-checks without marking.
