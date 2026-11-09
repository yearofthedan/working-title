# Testing

**Audience:** anyone writing or moving a test.
**Purpose:** where a test goes, what it is named, what runs it, and how a scenario's approved file is kept.

- **A test sits beside the code it tests**, named after it: `piece.test.ts` beside `piece.ts`, `scripts/audit.test.sh` beside `scripts/audit`.
- `./do test` runs the tests, `./do e2e` the journeys, and `./do check` every local check, the tests and the journeys among them. A shell suite beside a task runs under `./do test`, and so under `./do check`: `do.test.ts` spawns each one. What the checks are is `scripts/check`, which is what `./do` lists.
- **Every commit runs the checks first**: all of them, or only the docs, links and names checks for a change to Markdown alone outside `src/` and `e2e/`. An agent's commit that would skip them is refused.

## Levels

Most cases are unit or component tests; a journey is kept for what only the built app can show.

| Level | File | Starts | Runs in | Written as | Uses |
| --- | --- | --- | --- | --- | --- |
| Unit | `*.test.ts` beside the code | the code it tests, alone | node | `describe`/`it` | the code it tests |
| Component | `*.component.test.ts` beside a component | one component, mounted by its `*.harness.ts`. The app component's harness mounts the header, graph and panel together over a project in memory | Vitest browser mode | scenario files in its `scenarios/` folder, or `describe`/`it` for style, geometry or timing | its `*.test-page.ts`, its `*.dsl.ts`, and the Vitest driver |
| Journey | `e2e/*.spec.ts`, since it drives the whole product and no one file owns it | the built app, with the browser's own storage | Playwright ([ADR 7](../adr/0007-playwright-for-browser-specs.md)) | scenario files in `e2e/`, played by `e2e/scenarios.spec.ts`, or `test` | `e2e/journey.dsl.ts`, the `writer` fixture, and the Playwright driver |

- **A case is tested at the lowest level that can catch it.** Everything a unit test can reach is pushed down, where it runs in milliseconds and reads in one screen. A component test is for what only the rendered page shows. A journey is the last resort: it is worth its cost only where the built app, a driver, or the browser's own storage is what could break.
- **The file's name decides what runs it**: a `*.component.test.ts` runs in Vitest's browser project, any other test file under `src/` in node, and Playwright runs `e2e/`, which Vitest excludes.

## Where test code goes

A language names what the writer does over the driver contract, so one language runs under either protocol driver.

| Kind | File | Holds |
| --- | --- | --- |
| Language | `*.dsl.ts` beside its component, `e2e/journey.dsl.ts` | What the writer does and sees, in the [ubiquitous language](../domain/ubiquitous-language.md). The app's builds on the graph's and the panel's |
| Driver contract | `src/test-helpers/driver.ts` | What a language asks of a driver, and finding by role and label |
| Protocol driver | `*.driver.ts` in `src/test-helpers/` | One per runner: Vitest's browser mode, Playwright |
| Test page | `*.test-page.ts` beside its component | A Locator for each part, by role or label where one exists |
| Harness | `*.harness.ts` beside its component | The component mounted alone, with the data and hooks a test needs |
| Measures | `field.ts`, `box.ts`, `look.ts` in `src/test-helpers/` | Measuring a part for a style, geometry or timing case: its box and scrolling, a field's caret and text, and whether it is drawn shown or hidden |
| Staging | `staging.ts`, `seed.ts` in `src/test-helpers/` | A page or a project the writer cannot make |
| Spec fixture | `e2e/writer.ts`, `e2e/private-build.ts` | Playwright fixtures: the writer, and a served copy of the build |

- **A component has one test page, one language and one harness.** One that holds another component builds on that component's own, and what the owner lacks is added to the owner's file.
- **A component test reaches markup only through the test page, and acts only through its language**, never through `userEvent` or the driver. It asserts with `expect.element` and an aria matcher, and reads style or a box only when the case is about style, geometry or timing.
- **A test page returns Locators**, each found inside its part and grouped by what the writer does with them, such as a card's `actions`, so a check retries until the page settles.
- **A spec and a language find no element; a driver finds one only by role or label**, as [the markup standard](markup.md) says.
- **A language imports the driver contract and no driver, and the app imports no test code.**
- **A registration every browser test shares** goes in a file `setupFiles` loads, such as `src/test-helpers/locators.ts`.

## Names and cases

- **A case is a scenario when the recorded tree can show the outcome, and a hand-written test when it cannot**, such as style, geometry or timing.
- **Code in `src/ui/` that touches the DOM is in a `*.dom.ts` file**, and its logic is in a plain file beside it, with a `describe`/`it` test the node project runs. A plain file uses no DOM global and imports no `*.dom.ts`. A component's `*.test-page.ts` and its `*.harness.ts` are test code, and may use DOM globals and reach the component's `*.dom.ts`.
- **A unit test is `describe` and `it`**: the subject, then the behaviour — "it refuses a value that parses but is not a project". The name says what the code does, so the body needs no comment saying it.
- **An `it.each` body holds no conditional.** Each row runs the same steps and the same check, with what differs passed in the table. A case the table cannot drive, such as an attribute present on one row and absent on the others, is a test of its own.
- **A journey is `test`**, named for the scenario it covers whole, because that name is the behaviour the writer sees.
- **An assertion that cannot fail is not a test.** Where nothing the code could do would make it fail, it goes: it reads as a guard while checking nothing.
- **A case over a setting covers a guarantee, not a value.** A setting gets a case only when changing it would quietly lose a guarantee, such as layers importing only inward or the app working offline, and the case shows that outcome failing. A case that reads a setting's value back fails only on a deliberate change and catches nothing, so it is not written. A setting a tool already holds by default passes before anything here exists, so a line left at that default gets no case either.

## Approved scenarios

The harness comes from the [Approved Scenarios](https://lexler.github.io/augmented-coding-patterns/patterns/approved-scenarios/) pattern: an approval file holds the input and the expected output, the runner regenerates it from what it observes, and the execution logic is written once.

- **A scenario file is the story template's acceptance criteria**, copied as agreed: a `Rule:` line, an optional `Sees: the app` line after it, then per scenario a heading and one fenced block holding its steps and, after them, what the runner observed. `Sees: the app` starts a journey's tree at the whole app rather than the graph, and `e2e/scenarios.spec.ts` is what reads it; the entry beside a `scenarios/` folder sets its root in code and does not read the line. A file that adds `Serves: a private build` runs against its own served copy of the build, which its steps can publish a new version into, and `e2e/scenarios.spec.ts` is what reads that line too. A file that does not read as it prints is refused, so what was agreed is never silently rewritten.
- **A step names what plays it**, and a phrase nothing plays or several play is refused.
- **What is observed is what the runner prints**, and a difference is refused as lines; replacing it is what approving means, and an approving run is one played with that option set.
- **A tree marks the element that holds focus when the scenario asserts focus**, and prints as it always has when it asserts none: a marker on a line is a claim the scenario made, never one it did not.
- **A scenario file is named for what it is about** — `focus-interactions`, `your-words-survive-a-reload` — **and ends `.approved.md`**; its `Rule:` line carries the claim verbatim from the story, so the name stays short while the claim stays exact.
- **Each `scenarios/` folder has one entry beside it**, the `*.component.test.ts` that globs the folder and gives `playScenarioFiles` the driver and that language's steps. It generates a test per scenario, so a story adds no hand-written test code. The journeys in `e2e/` have `e2e/scenarios.spec.ts`.
- **Only `./do approve <scenario file>` writes an observed block.** It finds the entry beside the folder and runs that entry with the file named, so only that file records; `./do test` refuses `--update`, and a browser run may write a file only when approving set API allowWrite for it.
- **A scenario file holds one rule**, and a case the format cannot express is a `describe`/`it` test against the same driver, with nothing built for it.
- **A scenario lands in the file for the behaviour it specifies**, whichever story brings it, and that file changes when the behaviour does: a story that extends or changes a recorded scenario quotes it as it will read there, and a story whose scenario restates a recorded one adds none, since a copy can fail only when the original does. The issue is the dated record of what each story asked for; the file holds what is true now.
- **The tree flattens whitespace**, so a facet's text as the writer typed it is carried by a unit test on the storage round trip, not by a scenario's recorded tree.
