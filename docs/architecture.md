# Architecture

**Audience:** anyone changing code or deciding where something new belongs.
**Purpose:** shows the shape of the system and how its decisions fit together. Why each decision was made is in its [record](adr/README.md); terms are in the [ubiquitous language](ubiquitous-language.md).

working-title is a web app that runs entirely in the writer's desktop browser. The writer's work is saved in browser storage as they type and mirrored in the background to a folder they choose, as readable Markdown. What the writer plans with (piece types, their facets, the stages of the method) comes from a method definition the app reads, not from code.

## Parts

```
UI ──► application ──► domain ◄── method definition
            │
          ports
            │
   browser working copy ──► folder mirror

service worker ──► the built app, cached on the first load
```

- **UI:** what the writer sees and does. It calls only the application. ([ADR 2](adr/0002-hexagonal-layers.md))
- **Application:** the use cases (focus, elaborate, branch, link, capture) and queries (next moves, upstream, what links here). It reaches storage only through ports. ([ADR 2](adr/0002-hexagonal-layers.md))
- **Domain:** pieces, facets, links, chapters and the engine that runs a method, named in the ubiquitous language. It depends on nothing outside itself. ([ADR 2](adr/0002-hexagonal-layers.md))
- **Method definition:** Snowflake, extended, as data the engine reads. The code never names a method. ([ADR 5](adr/0005-method-as-data.md))
- **Browser working copy:** where every change is saved first, so typing never waits on a file. ([ADR 3](adr/0003-browser-copy-mirrored-to-folder.md))
- **Folder mirror:** the writer's own copy, one Markdown file per piece, and the source the app restores from when browser storage is lost. ([ADR 3](adr/0003-browser-copy-mirrored-to-folder.md), [ADR 4](adr/0004-one-markdown-file-per-piece.md))
- **Service worker:** serves the app's own files. The app is static files from one build, and the service worker caches all of it, fonts included, on the first load, so the app opens with no network after that, as the start-up target asks. ([ADR 1](adr/0001-no-backend-in-v1.md))

## Constraints

- No backend: no server, no accounts, one writer on one device. ([ADR 1](adr/0001-no-backend-in-v1.md))
- Desktop Chromium only, because writing to a folder the writer picks needs the File System Access API. ([ADR 3](adr/0003-browser-copy-mirrored-to-folder.md))

## Quality targets

Design size is about 300 pieces and 2,000 links.

| Attribute | Target |
| --- | --- |
| Durability | A crash loses at most about 2 s of typing |
| Disaster recovery | The folder mirror is at most about 10 s behind while typing |
| Typing | Every keystroke renders within one frame (16 ms) |
| Movement | A focus or level change takes under 100 ms |
| Data | Filtering and querying the whole project takes under 100 ms |
| Start-up | Usable within 2 s, and fully offline after the first load |
| Fidelity | Prose survives the round trip to Markdown and back unchanged |

## Toolchain

The code is TypeScript, checked and tested with [Vite+](https://github.com/voidzero-dev/vite-plus#readme) ([ADR 6](adr/0006-vite-plus-toolchain.md)), and the browser specs of the built app run in [Playwright](https://playwright.dev/docs/intro) ([ADR 7](adr/0007-playwright-for-browser-specs.md)).

- **Packages:** pnpm, on the Node.js version in `.node-version`. An install refuses a release younger than the cutoff, or weaker in publisher trust than an earlier release, both set in `pnpm-workspace.yaml` with any exception recorded beside the setting it excepts.
- **Updates:** [Renovate](https://docs.renovatebot.com/) pull requests, on the schedule in `renovate.json`.
- **Layers:** [dependency-cruiser](https://github.com/sverweij/dependency-cruiser) checks the direction of the layers, and cycles between modules, against `.dependency-cruiser.mjs`, as `./do layers` ([ADR 2](adr/0002-hexagonal-layers.md)).
- **Mutation:** StrykerJS writes faults into the domain and the application and reports the ones the tests let through, as `./do mutate` ([the workflow](../.github/workflows/mutate.yml)). A run fails when its score falls under one threshold for the whole run, with none per directory ([`thresholds`](https://stryker-mutator.io/docs/stryker-js/configuration#thresholds-object)), and the ruleset does not require that job.
- **Links:** every link the repository writes is checked to resolve, as `./do check-links`: a markdown file is read as prose and every other file as its comment lines, so the paths and headings a link points at inside the repository are checked on every check, and the sites it names in [a job of their own](../.github/workflows/links.yml), because a link dies with no commit here.
- **Tasks:** `./do` lists them and runs them. Where a test goes and what runs it is [the testing standard](standards/testing.md), and a story's scenarios run from their approved files ([ADR 8](adr/0008-story-scenarios-run-from-their-approved-files.md)).
- **CI:** every pull request to `main` runs `./do check`, which the ruleset on `main` requires by name ([the workflow](../.github/workflows/ci.yml)).
