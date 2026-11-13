# Contributing

**Audience:** anyone landing a change here, human or agent.
**Purpose:** the commands that check and hand over a change, and where the conventions for one are written.

- **Set up.** Two parts:
  - **The harness**, once per machine and again to update it: [snippets](https://github.com/yearofthedan/snippets#dev-skills)' `./do setup` installs OMP's plugins, Ponytail and dev-skills, or upgrades whichever is behind. Start a new OMP session after it changes anything.
  - **The repo:** `pnpm install` once per clone and once per worktree, which installs the dependencies and the git hooks; then `./do setup`, which installs weaver's skills into `.agents/skills/`.
- **Check.** `./do check` runs every local check. [Testing](docs/standards/testing.md) says what runs each test.
- **Verify a change.** For a change the writer sees, run it as a writer gets it: `./do preview` in the worktree, then clear the site's data (DevTools → Application → Storage → Clear site data) and reload, so the page is this build with a new project. `./do screenshot` shoots the built app at the widths the look criteria name, into `screenshots/`. For any other change, run what it changes, such as the script or the check, and read its output. Run `./do check` last either way.
- **Follow the standards.** [`docs/standards/README.md`](docs/standards/README.md) lists them; read the page that governs a file before writing it.
- **Commit and title.** [Commits and merges](docs/standards/commits.md).
- **Open the pull request** from [the template](.github/pull_request_template.md). `./do ready <pr>` marks it ready and names each condition it fails; `./do ready --check <pr>` re-checks without marking.
