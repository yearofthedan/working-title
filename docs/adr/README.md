# Architecture decision records

**Audience:** anyone who needs to know why the [architecture](../architecture.md) is the way it is, before changing it.
**Purpose:** records why each architecture decision was chosen over its alternatives, one record per decision.

How to decide whether a decision needs a record, and how to write one: [the writing-adrs skill](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/skills/writing-adrs/SKILL.md).

| # | Decision | Status |
| --- | --- | --- |
| [1](0001-no-backend-in-v1.md) | No backend in v1 | Accepted |
| [2](0002-hexagonal-layers.md) | Hexagonal layers | Accepted |
| [3](0003-browser-copy-mirrored-to-folder.md) | Browser working copy, mirrored to the writer's folder | Superseded by [11](0011-the-writers-folder-is-the-project.md) |
| [4](0004-one-markdown-file-per-piece.md) | One Markdown file per piece, in flat folders | Superseded by [12](0012-one-markdown-file-per-piece-holding-every-formatting-the-editor-offers.md) |
| [5](0005-method-as-data.md) | Method as data | Accepted |
| [6](0006-vite-plus-toolchain.md) | Vite+ as the toolchain | Accepted |
| [7](0007-playwright-for-browser-specs.md) | Playwright for the browser specs | Accepted |
| [8](0008-story-scenarios-run-from-their-approved-files.md) | Story scenarios run from their approved files | Accepted |
| [9](0009-graph-drawn-in-plain-html-and-css.md) | Graph drawn in plain HTML and CSS | Accepted |
| [10](0010-a-component-builds-its-own-element-and-the-app-places-it.md) | A component builds its own element and the app places it | Accepted |
| [11](0011-the-writers-folder-is-the-project.md) | The writer's folder is the project | Proposed |
| [12](0012-one-markdown-file-per-piece-holding-every-formatting-the-editor-offers.md) | One Markdown file per piece, holding every formatting the editor offers | Proposed |
