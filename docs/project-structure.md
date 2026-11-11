# Repository structure

**Audience:** anyone looking for where a file lives, or deciding where a new one goes.
**Purpose:** maps the code repository's folders and the suffixes of the files in them. The glossary's **project** is the writer's novel, so this page says repository for the code.

## The parts

| Folder | Part |
| --- | --- |
| [src/ui/](../src/ui/) | UI: one folder per component, shaped [as below](#a-components-folder) |
| [src/domain/](../src/domain/) | Domain |
| [src/application/](../src/application/) | Application |
| [src/ports/](../src/ports/) | Ports |
| [src/adapters/](../src/adapters/) | Browser working copy |
| [src/methods/](../src/methods/) | Method definition |

The [Parts table](architecture.md#parts) says what each part is, what it may import and why it is shaped that way.

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

A folder holds the files it needs, not all of them: [src/ui/app/](../src/ui/app/) has no `app.ts`, and [src/ui/graph/](../src/ui/graph/) adds `layout.ts` and its test. [src/ui/transition.ts](../src/ui/transition.ts) and its test sit at the top of `src/ui/`, outside any component's folder.

## Test code

[src/test-helpers/](../src/test-helpers/) holds the code every level shares: the driver contract and its protocol drivers, the measures (including `frames.ts`, the boxes sampled frame by frame for motion), staging and seed, the scenario file, step table and runner, the helpers that mount, open and read the app (`the-app.ts`, `graph-page.ts`, `recording.ts`), and small fixtures such as `toy-method.ts` and `ids.ts`. `locators.ts` is the registration every browser test loads.

[Testing](standards/testing.md#levels) says what each level is and what runs it.

## `e2e/`

[Where test code goes](standards/testing.md#where-test-code-goes) names the language, the `writer` fixture and the private-build fixture. Beyond them:

| File | Holds |
| --- | --- |
| `*.spec.ts` | A journey, or a check only the built app can make |
| `*.approved.md` | A journey's approved scenario file |
| [new-version.dsl.ts](../e2e/new-version.dsl.ts) | The language for a new version |
| [scenarios.spec.ts](../e2e/scenarios.spec.ts) | The entry that plays the approved files |

## `scripts/`

One file per `./do` task, named for it: `./do check` runs [scripts/check](../scripts/check). A leading `_` marks a file that is not a task: a helper or its data, or a test. A `*.test.sh` beside a task tests it.

## The rest of `src/`

| File | Holds |
| --- | --- |
| [src/main.ts](../src/main.ts) | The entry: registers the service worker and starts the app |
| [src/app.ts](../src/app.ts) | Start-up: opens the project and calls `renderApp` |
| [src/shell.css](../src/shell.css) | The page's layout, importing the tokens and the reset |
| [src/tokens.css](../src/tokens.css) | The colours and typefaces |
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

| File | Holds |
| --- | --- |
| [index.html](../index.html) | The page `src/main.ts` loads into |
| [vite.config.ts](../vite.config.ts) | The build, including the service worker |
| [.dependency-cruiser.mjs](../.dependency-cruiser.mjs) | The import rules `./do layers` enforces |
| [do](../do) | The entry to every task |

The other root files are configuration for a tool: `package.json`, `tsconfig.json`, `playwright.config.ts`, `stryker.*`, `renovate.json` and `pnpm-workspace.yaml`.
