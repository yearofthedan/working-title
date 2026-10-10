# working-title

A local-first planning and drafting tool for novelists, built on the Snowflake method.

Needs Node.js 24 and pnpm, which [`corepack enable`](https://nodejs.org/api/corepack.html) provides at the version `package.json` names. After cloning, run `pnpm install`, which installs the dependencies and the pre-commit hook. Then run `./do` to see the tasks, and `./do check` to run every local check; [AGENTS.md](AGENTS.md#running-tasks) says how tasks are added.

Run `./do setup` once per machine. It installs Ponytail, the skill the build work runs under, into your OMP.

How a story is written, agreed and implemented: [docs/dev-flow.md](docs/dev-flow.md).
