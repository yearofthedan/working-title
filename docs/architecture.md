# Architecture

**Audience:** anyone changing code or deciding where something new belongs.
**Purpose:** shows the shape of the system and how its decisions fit together. Why each decision was made is in its [record](adr/README.md); terms are in the [ubiquitous language](domain/ubiquitous-language.md).

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

| Part | What it is | Where | Decided by |
| --- | --- | --- | --- |
| UI | What the writer sees and does, drawn in plain HTML and CSS with no framework. It arranges the graph around the piece in focus, which it holds in memory alone, and calls only the application. | `src/ui/` | [ADR 2](adr/0002-hexagonal-layers.md), [ADR 9](adr/0009-graph-drawn-in-plain-html-and-css.md) |
| Application | The use cases (focus, elaborate, branch, link, capture) and queries (next moves, upstream, what links here). It reaches storage only through ports. | `src/application/` | [ADR 2](adr/0002-hexagonal-layers.md) |
| Domain | Pieces, facets, links, chapters and the engine that runs a method, named in the ubiquitous language. It depends on nothing outside itself. | `src/domain/` | [ADR 2](adr/0002-hexagonal-layers.md) |
| Method definition | Snowflake, extended, as data the engine reads. The code never names a method. | `src/methods/` | [ADR 5](adr/0005-method-as-data.md) |
| Ports | What the application asks of storage. | `src/ports/` | [ADR 2](adr/0002-hexagonal-layers.md) |
| Browser working copy | Where every change is saved first, so typing never waits on a file. | `src/adapters/` | [ADR 3](adr/0003-browser-copy-mirrored-to-folder.md) |
| Folder mirror | The writer's own copy, one Markdown file per piece, and the source the app restores from when browser storage is lost. | not built yet | [ADR 3](adr/0003-browser-copy-mirrored-to-folder.md), [ADR 4](adr/0004-one-markdown-file-per-piece.md) |
| Service worker | Serves the app's own files. The app is static files from one build, and the service worker caches all of it, fonts included, on the first load, so the app opens with no network after that. | `vite.config.ts` | [ADR 1](adr/0001-no-backend-in-v1.md) |
| Development environment | The builder's machine, the agents working in worktrees on it, and CI. Code from the package registry and commands from agents run here with the machine's credentials, which the app never holds. | `scripts/`, `.omp/`, `.github/workflows/` | |

## Constraints

- No backend: no server, no accounts, one writer on one device. ([ADR 1](adr/0001-no-backend-in-v1.md))
- Desktop Chromium only, because writing to a folder the writer picks needs the File System Access API. ([ADR 3](adr/0003-browser-copy-mirrored-to-folder.md))

## Quality targets

The attributes for the code are named as in [ISO/IEC 25010:2023](https://webstore.iec.ch/en/publication/90024). Confidence says how sure we are that the target holds today, judged on whether a break is caught early (before it reaches `main`), broadly (on every path it can arrive by) and reliably (by something automatic rather than someone remembering). High is all three; a rating below that says which is missing, and so where a check would raise it.

### For the writer

Design size is about 300 pieces and 2,000 links.

| Attribute | Target | Checked by | Confidence |
| --- | --- | --- | --- |
| Durability | A crash loses at most about 2 s of typing | [`your-words-survive-a-reload`](../e2e/your-words-survive-a-reload.approved.md) | Medium: a reload is checked, a crash mid-typing is not |
| Disaster recovery | The folder mirror is at most about 10 s behind while typing | nothing yet | Low: the folder mirror is not built |
| Typing | Every keystroke renders within one frame (16 ms) | nothing yet | Low: no test times a keystroke at the design size |
| Movement | A focus or level change starts within 100 ms, and every frame of the motion it brings renders within one frame (16 ms), at the design size | nothing yet | Low: nothing times a move or a frame at the design size; the motion a move brings is built, and the test below checks how long it takes, but not the 100 ms or the frame time |
| Motion | Motion meets WCAG 2.2 at AA, and stops when the writer's system asks for reduced motion (2.3.3), as the [motion standard](standards/motion.md) sets out | [`focus.browser.test.ts`](../src/ui/focus/focus.browser.test.ts), whose tests read `document.getAnimations()` for every kind of move, with the system asking for reduced motion and without, and [`motion.spec.ts`](../e2e/motion.spec.ts), which reads the graph's boxes every frame as the built app opens in a browser without the web font yet | Medium: every kind of move is timed in the browser — no animation over 400 ms, each easing out — and nothing moves at open or under reduced motion; motion on an action that is not a move is not checked |
| Data | Filtering and querying the whole project takes under 100 ms | nothing yet | Low: no test times a query at the design size |
| Start-up | Usable within 2 s, and fully offline after the first load | [`e2e/offline.spec.ts`](../e2e/offline.spec.ts) | Medium: offline is checked, the 2 s is not |
| Fidelity | Prose survives the round trip to Markdown and back unchanged | nothing yet | Low: the Markdown round trip is not built |
| Accessibility | Meets [WCAG 2.2](https://www.w3.org/TR/WCAG22/) at level AA. The [markup standard](standards/markup.md) sets how elements and their names are written | Review of the accessibility tree each story's approved files record ([ADR 8](adr/0008-story-scenarios-run-from-their-approved-files.md)); the lint, which makes specs find elements by role or label; [`e2e/contrast.spec.ts`](../e2e/contrast.spec.ts), which runs [axe-core](https://github.com/dequelabs/axe-core#readme)'s color-contrast rule on the built app; [`focus.browser.test.ts`](../src/ui/focus/focus.browser.test.ts), whose tests move the focus by Tab and by the arrow keys | Low: text contrast is checked on the built app on every run, except in an empty field, and on each field rather than on what is shown: a beat's or scene's text while it is not focused sits in an `aria-hidden` layer that axe skips, so only the browser test that draws that layer in its field's colour covers it. Beyond that and names, it rests on a reviewer noticing, non-text contrast such as a field's outline, the focus ring and the card edges included. Focus order and keyboard reach on the graph are checked in a browser, but nothing checks them with a screen reader |

### For the code

`./do check` runs the `./do` tasks named here other than `./do add` and `./do mutate`, and the ruleset on `main` requires it ([the workflow](../.github/workflows/ci.yml)).

| Attribute | What it guards against | Standard | Enforced by | Confidence |
| --- | --- | --- | --- | --- |
| Security of the development environment: integrity and resistance | A malicious release running on the machine when it is installed | The release cutoff and trust policy in `pnpm-workspace.yaml`, and the lockfile | pnpm, which applies both on every install ([`trustLockfile`](https://pnpm.io/settings/dependency-resolution#trustlockfile)); `./do add`, which audits a dependency in a scratch copy before it is installed; the dev-skills plugin's [`refuse-a-direct-add`](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/extensions/refuse-a-direct-add.ts), which `./do setup` installs; `./do audit` | High: pnpm refuses on every install, whoever runs it. The hook adds an earlier stop for agents only. No page states the policy, which lives in the settings and the scripts |
| Security of the development environment: confidentiality | A credential leaking, committed to the repository or read off the machine by an install script or an agent | none | `./do secrets`, over what is committed | Medium: `./do secrets` refuses a committed credential; nothing keeps one on the machine from an install script or an agent |
| Security of the app: integrity | A compromised dependency shipping into the writer's tab, which holds their manuscript and their folder's permission | as above | The install guards above, `./do audit`, [Renovate](https://docs.renovatebot.com/) on the schedule in `renovate.json`, and CodeQL on `main` | High |
| Modifiability | Moving storage, replacing the editor or changing the method forcing a change in the domain | [ADR 2](adr/0002-hexagonal-layers.md), [ADR 5](adr/0005-method-as-data.md) | `./do layers` | Medium: `./do layers` holds the direction between domain, application, ports, adapters and UI; nothing checks that a method's words stay out of the domain and the application |
| Testability | Behaviour that can only be checked in a browser, and tests that pass while the code is wrong | [Testing](standards/testing.md) | `./do test`; `./do layers`, the lint's locator rules and `./do check-names`, which refuse a file in the wrong layer; `./do layers` and the lint's DOM-globals rule, which refuse DOM code in a plain `src/ui/` file; review, for a test seen to fail first | Low: a test that passes while the code is wrong is caught only by a reviewer, or by `./do mutate`, which runs [on its own](../.github/workflows/mutate.yml) and which the ruleset does not require |
| Analysability | Code, files and docs an agent takes longer to read or find than it needs to, since agents write most of the code and copy what they find | The dev-skills plugin's [comments rule](https://github.com/yearofthedan/snippets/blob/main/plugins/dev-skills/rules/comments.md); doc openings and file names: none, each check holds its rule | The comments lint, `./do check-comments`, `./do check-names`, `./do check-docs`, `./do check-links` | Medium: the checks cover comments, names, doc openings and links; the rest is review |

## Toolchain

The code is TypeScript on the Node.js version in `.node-version`, installed with pnpm, checked and tested with [Vite+](https://github.com/voidzero-dev/vite-plus#readme) ([ADR 6](adr/0006-vite-plus-toolchain.md)), and the browser specs of the built app run in [Playwright](https://playwright.dev/docs/intro) ([ADR 7](adr/0007-playwright-for-browser-specs.md)). A story's scenarios run from their approved files ([ADR 8](adr/0008-story-scenarios-run-from-their-approved-files.md)). `./do` lists every task.
