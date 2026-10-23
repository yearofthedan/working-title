# Testing

**Audience:** anyone writing or moving a test.
**Purpose:** where a test goes, what it is named, what runs it, and how a scenario's approved file is kept.

- **A test sits beside the code it tests**, named after it: `piece.test.ts` beside `piece.ts`, `scripts/audit.test.sh` beside `scripts/audit`.
- **Browser specs of the built app are in `e2e/`**, as `<name>.spec.ts`, and run in Playwright ([ADR 7](../adr/0007-playwright-for-browser-specs.md)). They drive the whole app, so no one file is theirs.
- **A spec drives the app through the writer driver**, `e2e/writer.ts`: its `writer` fixture names what the writer does, in the [ubiquitous language](../ubiquitous-language.md), and hands out the scope a scenario's part reaches the page through. The driver finds elements by role or label only, as the writer would. Lint fails a call to any element-finding API in `e2e/`, and in the driver anything but `getByRole` and `getByLabel`; `vite.config.test.ts` shows each case failing. Page's selector actions, such as `page.click('#id')`, are caught only on a variable named `page`, so the driver closes over `page` rather than holding `this.page`. An element found inside `page.evaluate`, where the rules cannot see it, is the driver's job too.
- **The folder decides which spec runner runs a file**: Playwright runs only `e2e/` (`playwright.config.ts`), and Vitest runs every `*.test.*` and `*.spec.*` outside it, by [its default include](https://vitest.dev/config/include) with `e2e/` excluded in `vite.config.ts`. A test that needs a browser says so in its name — `*.browser.test.ts` — and the browser project takes those wherever they sit, because a file neither project matches runs nowhere and passes.
- `./do test` runs the tests, `./do e2e` the browser specs, and `./do check` every local check, the tests and the specs among them. A shell suite beside a task runs under `./do test`, and so under `./do check`: `do.test.ts` spawns each one. What the checks are is `scripts/check`, which is what `./do` lists.
- **Every commit runs the checks first**: the pre-commit hook runs `./do precommit`, which runs `./do check`, or only the docs, links and names checks for a change to Markdown alone outside `src/` and `e2e/`. An agent's `git commit --no-verify` or `-n` is refused (`.omp/lib/refuse-a-step-around-the-flow.ts`), so an agent cannot step around a failing check by skipping the hook. The checks read the working tree, so a change left unstaged counts towards a commit that leaves it out.

## Levels and names

- **A case is tested at the lowest level that can catch it.** A browser spec is the last resort: it is worth its cost only where the built app, the writer driver, or the browser's own storage is what could break. Everything a unit test can reach is pushed down, where it runs in milliseconds and reads in one screen.
- **Where a test lives follows from what it is about**: a journey through the whole built app is a scenario file in `e2e/`, played by Playwright; behaviour within one page is a scenario file in the page's `scenarios/` folder, played in Vitest browser mode; a logic contract is a `describe`/`it` test beside the code.
- **A unit test is `describe` and `it`**: the subject, then the behaviour — "it refuses a value that parses but is not a project". The name says what the code does, so the body needs no comment saying it.
- **A browser spec is `test`**, named for the scenario it covers whole, because that name is the behaviour the writer sees.
- **An assertion that cannot fail is not a test.** Where nothing the code could do would make it fail, it goes: it reads as a guard while checking nothing.
- **A case over a setting fails when the line this repository writes for it goes.** A setting a tool already holds by default passes before anything here exists, so a line left at that default gets no case, and any other is written with its why.

## Approved scenarios

The harness comes from the [Approved Scenarios](https://lexler.github.io/augmented-coding-patterns/patterns/approved-scenarios/) pattern: an approval file holds the input and the expected output, the runner regenerates it from what it observes, and the execution logic is written once.

- **A scenario file is the story template's acceptance criteria**, copied as agreed: a `Rule:` line, then per scenario a heading and one fenced block holding its steps and, after them, what the runner observed. `src/test-helpers/scenario-file.ts` refuses a file that does not read as it prints, so what was agreed is never silently rewritten.
- **A step names what plays it**, and a phrase nothing plays or several play is refused: `src/test-helpers/steps.ts`.
- **What is observed is what the runner prints**, and a difference is refused as lines; replacing it is what approving means, and an approving run is one played with that option set: `src/test-helpers/play.ts`.
- **A scenario file is named for what it is about** — `focus-interactions`, `your-words-survive-a-reload` — **and ends `.approved.md`**; its `Rule:` line carries the claim verbatim from the story, so the name stays short while the claim stays exact. One entry file per runner reads every scenario file and generates a test per scenario, so a story adds no hand-written test code: `src/scenarios.browser.test.ts` for the page scenarios, `e2e/scenarios.spec.ts` for the journeys.
- **Only `./do approve <scenario file>` writes an observed block.** It picks the runner by where the file is and runs that entry with the file named, so only that file records; `./do test` refuses `--update`, and a browser run may write a file only when approving set API allowWrite for it.
- **A scenario file holds one rule**, and a case the format cannot express is a `describe`/`it` test against the same driver, with nothing built for it.
- **The tree flattens whitespace**, so a facet's text as the writer typed it is carried by a unit test on the storage round trip, not by a scenario's recorded tree.
