# Ubiquitous language

**Audience:** anyone naming or describing things in this repo: stories, scenarios, code, tests, UI text, docs.
**Purpose:** gives each idea in the writer's world one name, says what it means and how it relates to the others, and lists the words not to use instead.

## How the terms relate

A **project** follows one **method**, and holds one **story**, zero or more **chapters** and zero or more **notes**. The method has **piece definitions**, each with its **facet definitions** in order and the **tags** it offers its children, and **stages**, whose order is the **flow**. **Pieces** form one tree under the story, each under one parent, in order among its siblings, and some pieces sit outside the tree. **Links** and **mentions** connect pieces. **Chapters** order the pieces that hold **prose** in the order a reader meets them, apart from the tree. The **current piece** is the piece the graph is centred on, and the **next moves** are what the method offers from there. The [domain model](model.md) holds the statements behind this.

```
Project ── follows ──► Method: piece definitions, facet definitions, tags, stages (the flow)
   ├── the story: the root piece of the tree
   ├── the tree: pieces, one parent each, each with facets
   ├── pieces outside the tree
   ├── links and mentions between pieces
   ├── chapters: prose pieces in reading order
   └── notes: about pieces or a passage, never pieces
```

## Two vocabularies

The **core** terms below name things every method has. They are the only words in domain and application code. The **method's own words** (novel, beat, scene, character, place, theme) belong to one method. In code they appear only in that method's definition under `src/methods/`, and in what shows or stores its pieces: scenarios, UI text, its saved data and the tests of those.

## Terms

| Term | Meaning | Not |
| --- | --- | --- |
| Project | One story being planned and written, with the method it follows | |
| Story | The root piece of the tree: what happens, as the writer plans it. Every method has one | |
| Title | The project's name. It belongs to the project, not to any piece | |
| Folder | Where a project lives on the writer's machine: one file per piece, and a project file. The app makes it in the projects folder | |
| Projects folder | The folder the writer chooses once, where every project's folder is made | |
| Your projects | The list of the projects in the projects folder, and the way to start another | |
| Method | A way of planning a story: its piece definitions and its stages. The built-in one is Snowflake, extended | |
| Piece definition | What a method says a piece is: its facets in order, whether it sits in the tree or outside it, its advice, and the tags it offers its children | kind |
| Facet definition | What a method says one part of a piece is | facet, in the method's sense |
| Tag | A name a method offers for the job a child does, such as Setup, with guidance. The writer chooses which pieces carry it | slot |
| Stage | One step of the method. It elaborates a piece, branches it, or adds a piece outside the tree | level |
| Flow | The method's stages in the order the writer meets them | |
| Piece | One unit of the story the writer plans and writes. Its piece definition comes from the method | node, element |
| Facet | One part of a piece the writer fills in, such as a one-sentence summary, a page, or the prose | layer, depth |
| Short facet | A facet typed on the piece's card, such as a one-sentence summary or a list line, as opposed to a long facet | |
| Long facet | A facet typed in the panel beside the graph, such as a paragraph, a page or the prose, rather than on the piece's card | |
| Panel | The area beside the graph that holds one piece's facets for typing. It stays on the piece the writer opened until they close it or open another | |
| Elaborate | Fill in the next facet of a piece | go deeper |
| Branch | Split a part of a facet out into a child, whose facet is that part | |
| Upstream | The pieces above a piece in the tree, up to the story | |
| Link | A connection between two pieces, made by hand or by a mention | binding, dependency |
| Mention | A reference to another piece inside a facet, showing that piece's current name. It makes a link | |
| Prose | The facet that holds the novel's written text | draft (as a noun) |
| Chapter | A group of pieces with prose, in the order a reader meets them | |
| Manuscript | All the prose, chapter by chapter: the novel as a reader would read it | |
| Note | Something the writer wrote down about the work, about pieces or a passage of one of their facets. It may lead to pieces but is never one | |
| Graph | The view of the pieces in their tree, each piece's children in order under it | |
| Current piece | The piece the graph is centred on, drawn as the big card, where the path ends. Moving to another piece changes it; tabbing does not. A piece pinned in the panel can be a different one | |
| Focus | The element the keyboard acts on | |
| Next move | Something the writer can do from the current piece: a stage whose needs are filled, or a tag no child carries yet | |
| Replan | Revisit the plan after drafting: the pieces upstream of the current piece and the pieces linked to it | |
| Notice | A quiet line in the header that tells the writer something about the app itself, with a way to act on it | banner, toast, popup |
| New version | A build of the app that has installed in the browser beside the one running and does not run until the writer moves onto it | update, release |
