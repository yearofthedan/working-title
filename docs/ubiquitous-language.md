# Ubiquitous language

**Audience:** anyone naming or describing things in this repo: stories, scenarios, code, tests, UI text, docs.
**Purpose:** gives each idea in the writer's world one name, says what it means and how it relates to the others, and lists the words not to use instead.

## How the terms relate

A **project** is one novel being planned and written, and it follows one **method**. The method sets out the kinds of **piece**, the **facets** each kind has, and the **stages** the writer works through; the stages in order are the **flow**. Pieces form one tree: the story at the root, and every other piece under one parent, in order among its siblings. A piece's **level** is where it sits in that tree. **Collections**, such as the cast and places, sit outside the tree. **Links** join any two pieces, across the tree and into collections. **Chapters** group the pieces that hold **prose** in the order a reader meets them, apart from the tree. The **focus** is the piece the writer is on, and the **next moves** are what the method offers from there.

```
Project ── follows ──► Method: piece kinds, facets, stages
   ├── the tree: pieces, one parent each, each with facets
   ├── collections: cast, places
   ├── links between any two pieces
   └── chapters: prose pieces in reading order
```

## Two vocabularies

The **core** terms below name things every method has. They are the only words in domain and application code. The **method's own words** (novel, beat, scene, character, place) belong to one method. They appear only in that method's definition under `methods/`, and in scenarios and UI text that show its pieces.

## Terms

| Term | Meaning | Not |
| --- | --- | --- |
| Project | One novel being planned and written, with the method it follows | |
| Method | A way of planning a novel: its kinds of piece, their facets and its stages. The built-in one is Snowflake, extended | |
| Stage | One step of the method. It either elaborates a piece or branches it | level |
| Flow | The method's stages in the order the writer meets them | |
| Piece | One unit of the story the writer plans and writes. Its kind comes from the method | node, element |
| Facet | One part of a piece the writer fills in, such as a one-sentence summary, a page, or the prose | layer, depth |
| Elaborate | Fill in the next facet of a piece | go deeper |
| Branch | Add child pieces under a piece | |
| Level | Where a piece sits in the tree. Up a level is its parent; down a level is its children | stage |
| Upstream | The pieces above a piece in the tree, up to the story | |
| Collection | A group of pieces outside the tree that exist to be linked to, such as the cast and places | |
| Link | A connection between two pieces, made by hand or by a mention | binding, dependency |
| Mention | A reference to another piece inside prose, showing that piece's current name. It makes a link | |
| Prose | The facet that holds the novel's written text | draft (as a noun) |
| Chapter | A group of pieces with prose, in the order a reader meets them | |
| Manuscript | All the prose, chapter by chapter: the novel as a reader would read it | |
| Focus | The piece the writer is working on | |
| Next move | Something the writer can do from the focus: a stage the method offers, or a move up or down a level | |
| Capture | Add a piece outside the flow, linked to the focus from the start | |
| Replan | Revisit the plan after drafting: the pieces upstream of the focus and the pieces linked to it | |
| Theme | What the novel is about, in the writer's words. It belongs to the project, not to any piece | |
