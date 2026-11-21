# Project structure

**Audience:** anyone looking for where a file lives, or deciding where a new one goes.
**Purpose:** maps the code repository's folders and the suffixes of the files in them. The glossary's **project** is the writer's story, so the page's name is the only place it says project for the code; the text says repository.

## The parts

| Folder | Part |
| --- | --- |
| [src/ui/](../src/ui/) | UI: the folders of the components the app places, shaped [as below](#a-components-folder), and the files they share |
| [src/ui/header/](../src/ui/header/) | UI: the header the app places on every screen: the title, the path, and the notice a new version waits behind |
| [src/ui/project/](../src/ui/project/) | UI: the screen shown once a project is open, and the components inside it |
| [src/ui/your-projects/](../src/ui/your-projects/) | UI: the screens shown before a project is open |
| [src/domain/](../src/domain/) | Domain |
| [src/application/](../src/application/) | Application |
| [src/ports/](../src/ports/) | Ports |
| [src/adapters/](../src/adapters/) | Adapters: the browser working copy and the projects folder |
| [src/methods/](../src/methods/) | Method definition |

The [layers](architecture.md#the-layers), the [method definition](architecture.md#method-definition) and what sits [outside the layers](architecture.md#outside-the-layers) are described in the architecture page: what each is, what it may import and why it is shaped that way.

## A component's folder

A component's folder holds the component and its test code, each file named after the component. What a language, a test page and a harness are is in [where test code goes](standards/testing.md#where-test-code-goes).

| Suffix | Holds |
| --- | --- |
| `<component>.ts` | The component's logic, with no DOM |
| `<component>.dom.ts` | The component's DOM code. Its one exported value is `render<Component>`, such as `renderGraph`, which builds the component and returns its handle; it exports types beside it and nothing else |
| `<component>.test.ts` | Its unit test |
| `<component>.component.test.ts` | Its component test |
| `<component>.dsl.ts` | Its language |
| `<component>.dsl.test.ts` | A unit test of its language |
| `<component>.test-page.ts` | Its test page |
| `<component>.harness.ts` | Its harness |
| `scenarios/` | Its approved scenario files |

A component used only inside another sits in a folder inside the one that holds it, shaped as above: [src/ui/project/](../src/ui/project/) holds [graph/](../src/ui/project/graph/) and [panel/](../src/ui/project/panel/), and `graph/` holds [card/](../src/ui/project/graph/card/); [src/ui/your-projects/](../src/ui/your-projects/) holds [projects-folder/](../src/ui/your-projects/projects-folder/) and [project-list/](../src/ui/your-projects/project-list/), and `project-list/` holds [start-a-project/](../src/ui/your-projects/project-list/start-a-project/).

A folder holds the files it needs, not all of them: [src/ui/project/](../src/ui/project/) has no `project.ts`, and [src/ui/project/graph/](../src/ui/project/graph/) adds [layout.ts](../src/ui/project/graph/layout.ts) and its test. [src/ui/header/](../src/ui/header/) adds [header.css](../src/ui/header/header.css), its styles. [src/ui/icons/](../src/ui/icons/) holds one icon per file, each a function returning its `SVGElement`, and [svg.dom.ts](../src/ui/icons/svg.dom.ts), the drawing they are built with; [src/ui/transition.ts](../src/ui/transition.ts) and its test sit at the top of `src/ui/`, outside any component's folder.

A component reaches another only through that component's `render<Component>`, and a type from its plain modules: their values are the component's own. Tests, test pages, harnesses and languages reach across. `./do check-names` refuses a `*.dom.ts` that exports anything else, and `./do layers` refuses the import.

## Test code

A helper sits in the `test-helpers/` folder of the nearest folder that holds every file importing it: a component's own folder where one component uses it, `src/ui/` where several do, and [src/test-helpers/](../src/test-helpers/) for what reaches beyond `src/ui/`, such as `e2e/` and the app's own layers. Each folder holds one file per kind it needs — `measures.ts`, `seed.ts`, `staging.ts` — and a whole file that moves into one keeps its name, such as `graph-page.ts`. [Testing](standards/testing.md#where-test-code-goes) lists every kind and what it holds, and `./do layers` refuses a file that reaches a `test-helpers/` folder from outside the folder holding it. It also refuses a component's test code reaching another component's test code outside one it holds, except `src/ui/project/`'s reach into `src/ui/your-projects/`'s test page and language, which tests start-up.

[src/test-helpers/](../src/test-helpers/) is a folder per kind:

| Folder | Holds |
| --- | --- |
| `drivers/` | The driver contract and what a language reads by, and the Vitest browser and Playwright drivers |
| `measures/` | The measures, including `frames.ts`, the boxes sampled frame by frame for motion |
| `staging/` | `staging.ts` for a page, and `graph-page.ts` and `the-app.ts` for the app the writer cannot make |
| `folders/` | `folder.ts`, which prints what the folder the writer chose holds and narrows it to the folder or file a step reported, and the folders on the writer's machine |
| `seed/` | A project, its ids, and a method the code runs in place of a real one |
| `runner/` | The scenario file, the step table and the runner, the entry each component test with a `scenarios/` folder calls, and the files they walk |

[locators.ts](../src/test-helpers/locators.ts) and [matchers.ts](../src/test-helpers/matchers.ts) are the registrations every browser test loads, so they stay at the top of the folder.

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
| [src/app.ts](../src/app.ts) | Start-up: places the component for the screen, opening a project with `renderProject` |
| [src/ui/strings/](../src/ui/strings/) | The app's words: `en.ts` holds every sentence and label the UI and start-up show, and `strings.ts` types them, so a file that shows one imports `strings` from it |
| [src/page.css](../src/page.css) | The page's layout, the rules every screen shares (the icon size and the move between screens), and the styles of each component but the header, which has its own in `header.css`; it imports the tokens, the reset and `header.css` |
| [src/tokens.css](../src/tokens.css) | The design tokens: colours, typefaces, text sizes, spacing and motion timing |
| [src/reset.css](../src/reset.css) | The browser defaults the app resets |

## Top level

| Folder | Holds |
| --- | --- |
| [src/](../src/) | The app |
| [e2e/](../e2e/) | The journeys |
| [scripts/](../scripts/) | The `./do` tasks |
| [lint/](../lint/) | The lint rules this repository's standards enforce, one module per concern, each with its test, composed by [lint/index.ts](../lint/index.ts) into the `overrides` that `vite.config.ts` sets |
| [docs/](README.md) | The pages, and where a new one goes |
| [designs/](../designs/README.md) | The designs of stories not built yet |
| [public/](../public/) | The app's icons: the page's favicon and the manifest's |
| [.github/](../.github/) | The issue and pull request templates, and the workflows |
| [.omp/](../.omp/) | The rules and settings OMP reads |
| [.agents/](../.agents/) | The skills an agent uses: the repository's own, and weaver's, which `./do setup` installs |
| [.vite-hooks/](../.vite-hooks/) | The git hooks, which call `./do precommit`, `./do commit-msg` and `./do pre-push` |

| File | Holds |
| --- | --- |
| [index.html](../index.html) | The page `src/main.ts` loads into |
| [vite.config.ts](../vite.config.ts) | The build, including the service worker, and the test, lint and format settings |
| [.dependency-cruiser.mjs](../.dependency-cruiser.mjs) | The import rules `./do layers` enforces |
| [do](../do) | The entry to every task |

The other root files are not code the app runs: the tests of the root configuration and of `./do` ([do.test.ts](../do.test.ts), [do.test.sh](../do.test.sh), [pnpm-workspace.test.ts](../pnpm-workspace.test.ts), [vite.config.test.ts](../vite.config.test.ts)), the docs ([README.md](../README.md), [AGENTS.md](../AGENTS.md), [CONTRIBUTING.md](../CONTRIBUTING.md)), the lockfile ([pnpm-lock.yaml](../pnpm-lock.yaml)), and configuration for a tool: [package.json](../package.json), [tsconfig.json](../tsconfig.json), [playwright.config.ts](../playwright.config.ts), [stryker.config.mjs](../stryker.config.mjs), [stryker.vitest.config.ts](../stryker.vitest.config.ts), [renovate.json](../renovate.json), [pnpm-workspace.yaml](../pnpm-workspace.yaml), [.node-version](../.node-version), [.gitignore](../.gitignore) and [.secretlintrc.json](../.secretlintrc.json).
