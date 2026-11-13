# working-title

A local-first planning and drafting tool for novelists, built on the Snowflake method.

Needs Node.js 26 and pnpm, which [`corepack enable`](https://nodejs.org/api/corepack.html) provides at the version `package.json` names. After cloning, run `pnpm install`, which installs the dependencies and the git hooks. Then run `./do` to see the tasks, and `./do check` to run every local check; [AGENTS.md](AGENTS.md#running-tasks) says how tasks are added.

Set up OMP and this repo as [CONTRIBUTING](CONTRIBUTING.md) says.

How a story is written, agreed and implemented: [docs/dev-flow.md](docs/dev-flow.md).

Where each folder and file suffix lives: [docs/project-structure.md](docs/project-structure.md).
