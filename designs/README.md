# Designs

**Audience:** anyone writing or building a story that changes what the writer sees.
**Purpose:** says what a design here is, and when one is added and removed.

A design is a mockup of something a story has not built yet, as a self-contained HTML file a browser opens. It is a proposal: the story's acceptance criteria say what is built, and the design shows how it is meant to look and read.

- **A design is here only while its story is unbuilt.** The pull request that closes the story deletes the design, so no design sits beside an app that has moved on from it.
- **A story links to its design at a commit**, so the link still opens the file after it is deleted.
- **What lasts moves to where it belongs when the story is built**: colours and typefaces to [src/tokens.css](../src/tokens.css), and the reasons to the story and its pull request.
