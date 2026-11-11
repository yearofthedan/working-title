# Repository structure

**Audience:** anyone looking for where a file lives, or deciding where a new one goes.
**Purpose:** maps the code repository's folders and the suffixes of the files in them. The glossary's **project** is the writer's novel, so this page says repository for the code.

## The layers

| Folder | Part |
| --- | --- |
| [src/domain/](../src/domain/) | Domain |
| [src/application/](../src/application/) | Application |
| [src/ports/](../src/ports/) | Ports |
| [src/adapters/](../src/adapters/) | Browser working copy |
| [src/methods/](../src/methods/) | Method definition |

The [Parts table](architecture.md#parts) says what each part is, what it may import and why it is shaped that way.

## A component's folder

`src/ui/<component>/` holds the component and its test code, each file named after the component:

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

[src/test-helpers/](../src/test-helpers/) holds the runner every level shares: the driver contract and its protocol drivers, the measures, staging and seed, and the scenario file and step table.

[Testing](standards/testing.md#levels) says what each level is and what runs it, and [where test code goes](standards/testing.md#where-test-code-goes) what each kind holds.

## `e2e/`

| File | Holds |
| --- | --- |
| `*.spec.ts` | A journey, or a check only the built app can make |
| `*.approved.md` | A journey's approved scenario file |
| [journey.dsl.ts](../e2e/journey.dsl.ts) | The journey's language |
| [new-version.dsl.ts](../e2e/new-version.dsl.ts) | The language for a new version |
| [writer.ts](../e2e/writer.ts) | The `writer` fixture |
| [private-build.ts](../e2e/private-build.ts) | The fixture that serves a private build |
| [scenarios.spec.ts](../e2e/scenarios.spec.ts) | The entry that plays the approved files |

## `scripts/`

One file per `./do` task, named for it: `./do check` runs [scripts/check](../scripts/check). A leading `_` marks a file that is not a task: a helper the tasks source, or a test. A `*.test.sh` beside a task tests it.

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
