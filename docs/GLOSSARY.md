# Glossary

**For:** anyone naming things in this repo: types, use cases, tests, scenarios, UI text, docs.
**Holds:** the core vocabulary, what each word means, and the words not to use instead.
**Changes when:** a PR adds a domain type or a new term to scenarios or the UI; the PR adds the term here.

There are two vocabularies. The **core** is method-neutral and is the only language in domain and application code. The **method vocabulary** (novel, beat, scene, character, place) lives only in a method definition under `methods/`, and in scenarios and UI text that show a method's pieces.

| Term | Meaning | Not |
| --- | --- | --- |
| Project | The container: file, settings, method and version | |
| Method | A declarative definition of piece types, facets and stages; the built-in is Snowflake, extended | |
| Stage | One step of the method; it either elaborates or branches | level |
| Flow | The method's stages in order, as the writer experiences them | |
| Piece | A story unit with a stable ID, a type and facets | node, element |
| Facet | One content slot on a piece (sentence, page, prose) | layer, depth |
| Elaborate | Fill or open the next facet on a piece | go deeper |
| Branch | Create child pieces under a piece | |
| Level | Where a piece sits in the tree; up or down a level is parent or child | stage |
| Upstream | A piece's ancestors in the tree | |
| Collection | A root outside the planning tree whose pieces exist to be linked to: cast, places | |
| Link | A from, to, kind record, made by hand or from a mention | binding, dependency |
| Mention | An inline piece ID in prose, showing the piece's current name; it creates a link | |
| Prose | The facet holding written text | draft (as a noun) |
| Chapter | An ordered grouping of scenes in manuscript order, separate from the tree | |
| Manuscript | All scene prose in chapter order; what an export produces | |
| Focus | The piece the writer is on | |
| Next move | A stage available to the focused piece, or a level move | |
| Capture | Create a piece outside the flow, linked to the focus from the start | |
| Theme | One project-level text, editable at any time, shown wherever the writer focuses; not a piece, not a stage, never linked | |

*Snowflake, extended* is Snowflake plus documented additions, of which there are none yet.

Replan is a use case, not a domain object: it reaches upstream pieces and pieces linked to the focus.
