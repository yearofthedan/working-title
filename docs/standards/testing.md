# Testing

**Audience:** anyone writing or moving a test.
**Purpose:** where a test goes, what it is named, what runs it, and how a scenario's approved file is kept.

- **A test sits beside the code it tests**, named after it: `piece.test.ts` beside `piece.ts`, `scripts/audit.test.sh` beside `scripts/audit`.
- **A journey drives the built app in `e2e/`**, as `<name>.spec.ts`, and runs in Playwright ([ADR 7](../adr/0007-playwright-for-browser-specs.md)). It drives the whole product, so no one file owns it.
- **The level a test starts at decides its name and the project that runs it**: a unit test is `*.test.ts`; a component test is `*.component.test.ts` and mounts one component alone; an app test is `*.app.test.ts` and starts the whole app from source on a staged shell; a journey is `e2e/*.spec.ts`. The build separates an app test from a journey ([ADR 7](../adr/0007-playwright-for-browser-specs.md)): a journey needs the built app, so it runs in Playwright, which runs only `e2e/` (`playwright.config.ts`), while Vitest runs the unit, component and app tests and excludes `e2e/` in `vite.config.ts`. The suffix decides the project: a `*.component.test.ts` or `*.app.test.ts` runs in the browser project, and a test file with any other name runs in node.
- `./do test` runs the tests, `./do e2e` the journeys, and `./do check` every local check, the tests and the journeys among them. A shell suite beside a task runs under `./do test`, and so under `./do check`: `do.test.ts` spawns each one. What the checks are is `scripts/check`, which is what `./do` lists.
- **Every commit runs the checks first**: all of them, or only the docs, links and names checks for a change to Markdown alone outside `src/` and `e2e/`. An agent's commit that would skip them is refused.

## The layers

A spec drives the app through the language, over a driver, so what it says is the writer's words and what it touches is one file. The code that plays a scenario sits in one of six layers:

| Layer | File | Holds |
| --- | --- | --- |
| Language | `src/ui/graph/graph.dsl.ts`, `src/ui/card/card.dsl.ts`, `e2e/journey.dsl.ts` | What the writer does and sees on a page, in the [ubiquitous language](../domain/ubiquitous-language.md), written once over the driver contract. A page's or a component's language sits beside it, a journey's in the runner's folder, and each step phrase calls it |
| Driver contract | `src/test-helpers/driver.ts` | What a language asks of a driver, and the finding by role and label that both drivers share |
| Protocol driver | `src/test-helpers/vitest-browser.driver.ts`, `src/test-helpers/playwright.driver.ts` | One per runner: the page in Vitest's browser mode, the built app in Playwright |
| Test page | `src/ui/graph/graph.test-page.ts`, `src/ui/card/card.test-page.ts` | A component test's or an app test's finders for its component's markup: each part by role or label where one exists, and the names that have no role |
| Staging | `src/test-helpers/staging.ts`, `src/test-helpers/seed.ts` | An arrangement the writer cannot make: a page, such as one with an extra header or a narrowed pane, or the project a scenario starts from, such as one with fewer beats than the method starts a project with. A component mounted alone is staged by its own harness |
| Component harness | `src/ui/graph/graph.harness.ts`, `src/ui/card/card.harness.ts` | A component's staging, mounted alone: the one component, with the data and hooks a scenario needs, and the root its recorded tree is taken from |
| Spec fixture | `e2e/writer.ts` | The Playwright `writer` fixture, and the helpers only a spec needs, built on the Playwright driver |

- **A `*.dsl.ts` imports the driver contract and no `*.driver.ts`**, and nothing the app is made of imports a language file, a driver, a harness or the contract: a test, another language file, a driver, a harness and `src/test-helpers/` are what may. `./do layers` refuses the rest.
- **A file naming `StepAction` is a `*.dsl.ts`**, except under `src/test-helpers/`, where the runner and its tests live. `./do check-names` refuses the rest.
- **A spec and a language file find no element, and a driver finds one only by role or label**, as [the markup standard](markup.md) names it: an element says what the thing is, and its name means something to the writer hearing it. Lint fails a page's element-finding calls and `document.querySelector` and `document.querySelectorAll` in `e2e/` and in a `*.dsl.ts`, and in a driver anything but `getByRole` and `getByLabel`; `vite.config.test.ts` shows each case failing. Page's selector actions, such as `page.click('#id')`, are caught only on a variable named `page`, so a driver closes over `page` rather than holding `this.page`. An element found inside `page.evaluate`, where the rules cannot see it, is the driver's job too.
- **A component test or an app test reaches a component's markup only through that component's `*.test-page.ts`**, beside its `*.dom.ts`: the test page finds each part by role or label where one exists, and writes out the names that have no role itself. A test builds a page no writer can make in `src/test-helpers/staging.ts`, and starts a scenario from a project no writer can make with `src/test-helpers/seed.ts`.

## Levels and names

- **A case is tested at the lowest level that can catch it.** A journey is the last resort: it is worth its cost only where the built app, a driver, or the browser's own storage is what could break. An app test comes next, for behaviour only the whole app can show. A component test mounts one component alone, in its own tier, wherever no page-level behaviour is needed. Everything a unit test can reach is pushed down, where it runs in milliseconds and reads in one screen.
- **Where a test lives follows from what it is about**: a journey through the whole built app is a scenario file in `e2e/`, played by Playwright; behaviour within one page or one component is a scenario file in the page's or the component's `scenarios/` folder, played by the component test or app test beside it in Vitest browser mode; a logic contract is a `describe`/`it` test beside the code.
- **A case is a scenario when the recorded tree can show the outcome, and a hand-written test when it cannot**, such as style, geometry or timing.
- **Code in `src/ui/` that touches the DOM is in a `*.dom.ts` file**, and its logic is in a plain file beside it, with a `describe`/`it` test the node project runs. A plain file uses no DOM global and imports no `*.dom.ts`. A component's `*.test-page.ts` and its `*.harness.ts` are test code, and may use DOM globals and reach the component's `*.dom.ts`.
- **A unit test is `describe` and `it`**: the subject, then the behaviour — "it refuses a value that parses but is not a project". The name says what the code does, so the body needs no comment saying it.
- **A journey is `test`**, named for the scenario it covers whole, because that name is the behaviour the writer sees.
- **An assertion that cannot fail is not a test.** Where nothing the code could do would make it fail, it goes: it reads as a guard while checking nothing.
- **A case over a setting covers a guarantee, not a value.** A setting gets a case only when changing it would quietly lose a guarantee, such as layers importing only inward or the app working offline, and the case shows that outcome failing. A case that reads a setting's value back fails only on a deliberate change and catches nothing, so it is not written. A setting a tool already holds by default passes before anything here exists, so a line left at that default gets no case either.

## Approved scenarios

The harness comes from the [Approved Scenarios](https://lexler.github.io/augmented-coding-patterns/patterns/approved-scenarios/) pattern: an approval file holds the input and the expected output, the runner regenerates it from what it observes, and the execution logic is written once.

- **A scenario file is the story template's acceptance criteria**, copied as agreed: a `Rule:` line, then per scenario a heading and one fenced block holding its steps and, after them, what the runner observed. A file that does not read as it prints is refused, so what was agreed is never silently rewritten.
- **A step names what plays it**, and a phrase nothing plays or several play is refused.
- **What is observed is what the runner prints**, and a difference is refused as lines; replacing it is what approving means, and an approving run is one played with that option set.
- **A tree marks the element that holds focus when the scenario asserts focus**, and prints as it always has when it asserts none: a marker on a line is a claim the scenario made, never one it did not.
- **A scenario file is named for what it is about** — `focus-interactions`, `your-words-survive-a-reload` — **and ends `.approved.md`**; its `Rule:` line carries the claim verbatim from the story, so the name stays short while the claim stays exact. One entry per `scenarios/` folder reads every scenario file and generates a test per scenario, so a story adds no hand-written test code: the `*.component.test.ts` or `*.app.test.ts` beside it, which globs the folder and gives `playScenarioFiles` the driver and that language's steps; `e2e/scenarios.spec.ts` for the journeys; `./do layers` refuses a folder with no entry.
- **Only `./do approve <scenario file>` writes an observed block.** It finds the entry beside the folder and runs that entry with the file named, so only that file records; `./do test` refuses `--update`, and a browser run may write a file only when approving set API allowWrite for it.
- **A scenario file holds one rule**, and a case the format cannot express is a `describe`/`it` test against the same driver, with nothing built for it.
- **A scenario lands in the file for the behaviour it specifies**, whichever story brings it, and that file changes when the behaviour does: a story that extends or changes a recorded scenario quotes it as it will read there, and a story whose scenario restates a recorded one adds none, since a copy can fail only when the original does. The issue is the dated record of what each story asked for; the file holds what is true now.
- **The tree flattens whitespace**, so a facet's text as the writer typed it is carried by a unit test on the storage round trip, not by a scenario's recorded tree.
