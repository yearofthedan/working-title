# Project structure

**Audience:** anyone looking for where a file lives, or deciding where a new one goes.
**Purpose:** maps the code repository's folders and the suffixes of the files in them. The glossary's **project** is the writer's novel, so the page's name is the only place it says project for the code; the text says repository.

## The parts

| Folder | Part |
| --- | --- |
| [src/ui/](../src/ui/) | UI: one folder per component, shaped [as below](#a-components-folder) |
| [src/domain/](../src/domain/) | Domain |
| [src/application/](../src/application/) | Application |
| [src/ports/](../src/ports/) | Ports |
| [src/adapters/](../src/adapters/) | Adapters: the browser working copy |
| [src/methods/](../src/methods/) | Method definition |

The [layers](architecture.md#the-layers), the [method definition](architecture.md#method-definition) and what sits [outside the layers](architecture.md#outside-the-layers) are described in the architecture page: what each is, what it may import and why it is shaped that way.

## A component's folder

`src/ui/<component>/` holds the component and its test code, each file named after the component. What a language, a test page and a harness are is in [where test code goes](standards/testing.md#where-test-code-goes).

| Suffix | Holds |
| --- | --- |
| `<component>.ts` | The component's logic, with no DOM |
| `<component>.dom.ts` | The component's DOM code |
| `<component>.test.ts` | Its unit test |
| `<component>.component.test.ts` | Its component test |
| `<component>.dsl.ts` | Its language |
| `<component>.dsl.test.ts` | A unit test of its language |
| `<component>.test-page.ts` | Its test page |
| `<component>.harness.ts` | Its harness |
| `scenarios/` | Its approved scenario files |

A folder holds the files it needs, not all of them: [src/ui/app/](../src/ui/app/) has no `app.ts`, and [src/ui/graph/](../src/ui/graph/) adds [layout.ts](../src/ui/graph/layout.ts) and its test. [src/ui/transition.ts](../src/ui/transition.ts) and its test sit at the top of `src/ui/`, outside any component's folder.

## Test code

[src/test-helpers/](../src/test-helpers/) holds the code every level shares: the driver contract and its protocol drivers, the measures (including [frames.ts](../src/test-helpers/frames.ts), the boxes sampled frame by frame for motion), staging and seed, the scenario file, step table and runner, [scenario-entry.ts](../src/test-helpers/scenario-entry.ts), which each component test with a `scenarios/` folder calls, the helpers that mount, open and read the app ([the-app.ts](../src/test-helpers/the-app.ts), [graph-page.ts](../src/test-helpers/graph-page.ts)), and small fixtures: [recording.ts](../src/test-helpers/recording.ts), a driver that records its calls, [toy-method.ts](../src/test-helpers/toy-method.ts) and [ids.ts](../src/test-helpers/ids.ts). [locators.ts](../src/test-helpers/locators.ts) is the registration every browser test loads.

[Testing](standards/testing.md#levels) says what each level is and what runs it.

## `e2e/`

[Where test code goes](standards/testing.md#where-test-code-goes) names the language ([journey.dsl.ts](../e2e/journey.dsl.ts)), the `writer` fixture ([writer.ts](../e2e/writer.ts)) and the private-build fixture ([private-build.ts](../e2e/private-build.ts)). Beyond them:

| File | Holds |
| --- | --- |
| `*.spec.ts` | A journey, or a check only the built app can make |
| `*.approved.md` | A journey's approved scenario file |
| [new-version.dsl.ts](../e2e/new-version.dsl.ts) | The language for a new version |
| [scenarios.spec.ts](../e2e/scenarios.spec.ts) | The journeys' entry: it plays the approved files in `e2e/` through the runner directly |

## `scripts/`

One file per `./do` task, named for it: `./do check` runs [scripts/check](../scripts/check). A leading `_` marks a file that is not a task: a helper or its data, or a test. A `*.test.sh` beside a task tests it.

## The rest of `src/`

| File | Holds |
| --- | --- |
| [src/main.ts](../src/main.ts) | The entry: registers the service worker and starts the app |
| [src/app.ts](../src/app.ts) | Start-up: opens the project and calls `renderApp` |
| [src/shell.css](../src/shell.css) | The page's layout, importing the tokens and the reset |
| [src/tokens.css](../src/tokens.css) | The design tokens: colours, typefaces, text sizes, spacing and motion timing |
| [src/reset.css](../src/reset.css) | The browser defaults the app resets |

## Top level

| Folder | Holds |
| --- | --- |
| [src/](../src/) | The app |
| [e2e/](../e2e/) | The journeys |
| [scripts/](../scripts/) | The `./do` tasks |
| [docs/](README.md) | The pages, and where a new one goes |
| [public/](../public/) | The app's icons: the page's favicon and the manifest's |
| [.github/](../.github/) | The issue and pull request templates, and the workflows |
| [.omp/](../.omp/) | The rules and settings OMP reads |
| [.agents/](../.agents/) | The skills an agent uses: the repository's own, and weaver's, which `./do setup` installs |
| [.vite-hooks/](../.vite-hooks/) | The git hooks, which call `./do precommit` and `./do commit-msg` |

| File | Holds |
| --- | --- |
| [index.html](../index.html) | The page `src/main.ts` loads into |
| [vite.config.ts](../vite.config.ts) | The build, including the service worker, and the test, lint and format settings |
| [.dependency-cruiser.mjs](../.dependency-cruiser.mjs) | The import rules `./do layers` enforces |
| [do](../do) | The entry to every task |

The other root files are not code the app runs: the tests of the root configuration and of `./do` ([do.test.ts](../do.test.ts), [do.test.sh](../do.test.sh), [pnpm-workspace.test.ts](../pnpm-workspace.test.ts), [vite.config.test.ts](../vite.config.test.ts)), the docs ([README.md](../README.md), [AGENTS.md](../AGENTS.md), [CONTRIBUTING.md](../CONTRIBUTING.md)), the lockfile ([pnpm-lock.yaml](../pnpm-lock.yaml)), and configuration for a tool: [package.json](../package.json), [tsconfig.json](../tsconfig.json), [playwright.config.ts](../playwright.config.ts), [stryker.config.mjs](../stryker.config.mjs), [stryker.vitest.config.ts](../stryker.vitest.config.ts), [renovate.json](../renovate.json), [pnpm-workspace.yaml](../pnpm-workspace.yaml), [.node-version](../.node-version), [.gitignore](../.gitignore) and [.secretlintrc.json](../.secretlintrc.json).
