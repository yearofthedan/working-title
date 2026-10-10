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
```

- **UI:** what the writer sees and does. It calls only the application. ([ADR 2](adr/0002-hexagonal-layers.md))
- **Application:** the use cases (focus, elaborate, branch, link, capture) and queries (next moves, upstream, what links here). It reaches storage only through ports. ([ADR 2](adr/0002-hexagonal-layers.md))
- **Domain:** pieces, facets, links, chapters and the engine that runs a method, named in the ubiquitous language. It depends on nothing outside itself. ([ADR 2](adr/0002-hexagonal-layers.md))
- **Method definition:** Snowflake, extended, as data the engine reads. The code never names a method. ([ADR 5](adr/0005-method-as-data.md))
- **Browser working copy:** where every change is saved first, so typing never waits on a file. ([ADR 3](adr/0003-browser-copy-mirrored-to-folder.md))
- **Folder mirror:** the writer's own copy, one Markdown file per piece, and the source the app restores from when browser storage is lost. ([ADR 3](adr/0003-browser-copy-mirrored-to-folder.md), [ADR 4](adr/0004-one-markdown-file-per-piece.md))

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

The code is TypeScript, checked and tested with [Vite+](https://viteplus.dev/guide/) ([ADR 6](adr/0006-vite-plus-toolchain.md)): one dependency, `vite-plus`, bundles Vite, Vitest, Oxlint, Oxfmt and tsgolint, which type-checks with TypeScript 7, behind one config, `vite.config.ts`. pnpm manages packages, on Node.js 24.

`pnpm-workspace.yaml` is laid out as `vp migrate` writes it: its `catalog` pins `vite-plus` and points `vite` at the Vite+ core, so every dependency that imports `vite` gets the bundled copy, and an upgrade changes both versions there together. Its `peerDependencyRules` accept any `vite` version, because the core's own version number falls outside the ranges other packages ask for; a dependency that needs a newer Vite than Vite+ bundles is not warned about.

| Run | What it checks |
| --- | --- |
| `./do check` | Format, lint and types (`vp check`), then the tests (`vp test`) |
| Pre-commit hook, installed by `pnpm install` | `vp check --fix` on the staged files (`vp staged`) |
