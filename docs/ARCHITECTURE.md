# Architecture

**For:** anyone changing code: what the standing rules are and where things go.
**Holds:** today's rules only. Why each one was chosen is in its [decision record](adr/README.md); terms are in [GLOSSARY.md](GLOSSARY.md).
**Changes when:** a decision adds or changes a standing rule. A decision record comes with it when the writing-adrs skill says one is needed.

A desktop-Chromium PWA with no server: browser storage holds the working copy, a background mirror writes readable Markdown to a folder the writer picks, and writing methods are data, not code.

## Platform

- Desktop Chromium only (Chrome, Edge, Arc). Firefox and Safari are told up front that they can't keep work in a folder. Mobile is out of v1. ([ADR 2](adr/0002-browser-copy-mirrored-to-folder.md))
- No backend: no server, no accounts, no network after the first load. ([ADR 1](adr/0001-no-backend-in-v1.md))
- Deferred: sync, mobile, a Tauri shell, reading external edits back from the folder, manuscript export. LLM integration is undecided; nothing in v1 is shaped for it, and nothing may make adding it later painful.

## Quality targets

Design size is about 300 pieces and 2,000 links, with a 1,000-piece stretch test. It is an estimate; calibrate from a real novel when one is available.

| Attribute | Target | Checked by |
| --- | --- | --- |
| Durability | A crash loses at most about 2 s of typing | Kill the tab mid-sentence, reload: at most 2 s of text missing |
| Durability (disaster) | Folder mirror at most about 10 s behind while typing, about 2 s after a pause | Clear site data, restore from folder: at most 10 s lost |
| Typing | Every keystroke renders within one frame (16 ms) at design size | Scripted typing on the 300-piece fixture |
| Movement | Focus or level change under 100 ms | Timed navigation on the fixture |
| Graph | Smooth pan and zoom for whatever a view shows | Frame timing per view; the whole graph is never required on screen |
| Data layer | Filter and query the whole project under 100 ms | Query benchmarks on the 300 and 1,000-piece fixtures |
| Start-up | Usable within 2 s; fully offline after first load | Cold load timed; offline reload test |
| Mirror fidelity | Prose survives editor → Markdown → editor unchanged | Round-trip test over every formatting the editor allows |

Known risks to design against: an editor per graph card made the prototype's canvas slow; automatic graph layout was a recurring source of pain, so epic 1 chooses and proves a layout approach; re-granting folder access needs a user gesture, which background saves can't provide.

## Storage

([ADR 2](adr/0002-browser-copy-mirrored-to-folder.md))

- The app never touches storage directly. One storage adapter fronts both the IndexedDB working copy and the folder mirror (File System Access API).
- Browser storage saves about 1 s after a typing pause, and immediately on blur, tab switch or close. The app requests persistent storage.
- The mirror writes only changed pieces, serialised in a background worker, about 2 s after a pause and at least every 10 s while typing, never on the typing path.
- When browser storage is empty, the project is rebuilt from the folder, with typed errors for a missing, invalid or unreadable folder. Otherwise browser storage wins.
- After a reload the app offers an explicit "reconnect folder" action and shows when the folder is disconnected.
- The mirror is write-only: edits made to the files outside the app are not read back.

## Folder format

([ADR 3](adr/0003-one-markdown-file-per-piece.md))

- Flat folders by type (`beats/`, `scenes/`, `cast/`), one Markdown file per piece, named `slug--shortid.md`.
- Frontmatter holds ID, type, parent, order, schema version and method version. Filenames are for humans only.
- Each facet is a headed section. Prose is Markdown plus a small Pandoc-style extension (`[text]{.smallcaps}`, `:::` centred blocks). A mention is `[[Name|id]]`.
- `links.json` and `chapters.json` sit at the root.
- A removed piece keeps its file, marked removed in its frontmatter, until it is deleted for good. Versions are snapshots of a facet's text only, kept in `history/`, one file per piece, keyed by piece and facet; taken when work on a piece pauses, thinned to daily then weekly, kept about 90 days.
- The editor offers only formatting that round-trips. Manuscript formatting is applied at export, never stored.

## Data model

- **Method as data.** A method declares piece types, the facets each carries, and stages. A stage elaborates or branches, declares its dependencies and carries guidance (instruction text and an optional scaffold). A generic engine reads it. Each project records its schema version and its method and version, with a migration hook for both. ([ADR 4](adr/0004-method-as-data.md))
- **Piece.** A stable ID, a type and facets, one content slot per stage.
- **Tree.** Every piece has exactly one parent and an order among its siblings. Collections (cast, places) are roots outside the planning tree.
- **Chapter.** An ordered grouping of scenes in manuscript order, separate from the tree. Prose is stored on each scene.
- **Link.** From, to, kind and origin (manual or mention). A mention creates its link. "What links here" is a lookup.
- **Progress per piece.** Stage completion is tracked per piece. Next moves are the stages whose dependencies are met for the focused piece.
- **Piece summary.** A small indexed record per piece (stage reached, which facets hold text), updated on save, so a card shows its stage without loading facet text. A focus change reads the focus, its parent, children and linked pieces with their summaries in one query.
- **Theme.** One project-level text on the project, not a piece.

## Stack

Starting choices, not yet decisions. Each is proven against the quality targets by the first story that depends on it, and that story writes its decision record or replaces the choice.

| Concern | Choice |
| --- | --- |
| Editor | Tiptap (on ProseMirror) |
| UI | React + Vite |
| Service worker | vite-plugin-pwa |
| Graph | React Flow |
| Working store | IndexedDB via Dexie |
| Folder mirror | File System Access API |
| Styling | CSS custom properties as design tokens |
| Fonts | Two bundled typefaces (prose, interface), precached, `font-display: swap` |

## Code structure

([ADR 5](adr/0005-hexagonal-layers.md))

Dependencies point inward only: adapters → application → domain.

- `domain/`: pure TypeScript. Project, Piece, Facet, Link, Chapter, Collection and the method engine. No UI framework, storage library, editor or browser APIs. Type names come from the glossary.
- `application/`: use cases (focus, elaborate, branch, link, capture, move level, regroup chapters) and queries (next moves, upstream, what links here). The UI calls only these.
- Ports: `ProjectStore`, `Mirror`, `ProseCodec`. Prose is opaque to the domain; the codec turns it into Markdown and lists its mentions.
- `adapters/`: the browser store, the folder mirror, the UI (editor and graph inside it). Adapters never import each other.
- `methods/snowflake-extended`: a schema-validated definition file. Method vocabulary appears only here.

**Shared folders.** A `shared/` may exist at any level; only that level's subtree may import it, and it holds only what the whole subtree needs. Root `shared/` holds generic utilities and imports nothing from domain, application or adapters. A shared folder imports only from shared folders above it.

- Shared code lives in modules named by topic (`dates.ts`, `text.ts`, `ids.ts`), never `utils.ts`, and each shared folder has an index of its exports. Check the index before writing a helper.
- Code moves into shared when a second consumer in the subtree needs it, or when a topic module for it already exists.

## Checks

Each check runs at the earliest point where it is fast enough; CI reruns everything.

| Check | Enforced by | Earliest feedback |
| --- | --- | --- |
| Dependency direction and shared-folder scope | eslint-plugin-boundaries | As you type |
| Domain purity (no react, dexie, @tiptap, `window`, `document`, `indexedDB` in domain or application) | ESLint restricted imports and globals | As you type |
| No method vocabulary (beat, scene, character, snowflake) as identifiers in the core | ESLint rule | As you type |
| Every exported domain type is in GLOSSARY.md | Vitest test | On save |
| A toy three-act method runs through the engine unchanged | Vitest test | On save |
| Prose round-trips through Markdown unchanged | Vitest property test | On save |
| Lint and fast tests on changed files; duplicate code (jscpd) | Pre-commit hook | On commit |
| Durability, speed, one demo per epic | Playwright on the 300-piece fixture | CI |
| Tests that would pass on wrong code | Stryker, domain and application, incremental | CI (report only until a threshold is set) |

## Testing

([ADR 6](adr/0006-approved-scenarios.md))

Work outside-in: write the scenario, then build down.

- **Approved scenarios** are the bulk. Each use-case test runs against in-memory fakes of the ports and writes an `.approved.md` through the scenario printer. The file opens with the rule in one sentence; each scenario is a heading naming the behaviour; Given, When and Then sit in a fenced block as a tree (├ └ │), one complete phrase per line in glossary words; Then shows only the slice the scenario is about. Builder methods are named after the phrase they print (`withListLine` prints "with the list line").
- An approval changes only alongside a stated behaviour change. CI never writes or updates snapshots.
- **Domain:** unit and property tests for invariants (exactly one parent, ordered siblings, next moves respect dependencies).
- **Port contracts:** one suite per port, run against both the fake and the real adapter.
- **UI:** thin, few component tests, no UI snapshots.
- **End to end:** Playwright, one spec per epic scripting its demo, plus the quality checks. One writer-driver fixture speaks in glossary terms (`writer.focus('Beat 1')`); every locator lives in it.

**Layout.**

- Tests sit beside their code (`piece.test.ts` beside `piece.ts`). Scenario tests sit with their use case, approvals in `scenarios/*.approved.md` beside it. Contract suites sit next to their port. Only Playwright lives apart, in `e2e/`.
- `test-helpers/` follows the shared-folder rule, one per level with an index. `domain/test-helpers` holds one builder per domain type; `application/test-helpers` holds the fakes and the scenario printer. Production code never imports test-helpers.
- The 300-piece fixture comes from a seeded generator, not a committed blob.

**Conventions.**

- Test data comes from builders in glossary terms, never hand-built object literals of domain types.
- `test.extend` fixtures provide the wiring (store, fakes, use-case harness, printer). Builders say what; fixtures provide where.
- Tests find elements by role, label or text. `data-testid` only as a last resort.
