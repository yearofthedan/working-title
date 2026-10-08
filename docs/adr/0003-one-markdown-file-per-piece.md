# 3. One Markdown file per piece, in flat folders

Status: Accepted, 2026-10-04

## Context

What shape does the writer's folder take?

- The folder is the only copy outside the browser and the source for restoring it, so it must hold everything.
- Writers may read or open the files without the app, in any editor or a notes tool such as Obsidian.
- Pieces are restructured often: beats added and removed, scenes moved between beats.
- The browser's file API has no reliable directory move.
- A project is about 300 pieces, and a restore has to read all of them.

## Decision

One Markdown file per piece, in flat folders by type. Structure (ID, type, parent, order) lives in frontmatter, never in folder paths or filenames. Links and chapters are separate files at the root.

## Alternatives considered

- **One project file (JSON).** Simple to write and restore, but unreadable without the app, rewritten in full on every save, and one bad write loses everything.
- **.docx.** Familiar to writers, but cannot carry the plan's structure losslessly and is hard to write from a browser.
- **Markdown nested by the tree.** Mirrors the plan, but with no directory move in the browser's file API, every restructure becomes a copy-then-delete of many files.

## Consequences

The browser's file API has no reliable directory move, so flat folders keep restructuring cheap, and renames never break anything. The editor may offer only formatting that round-trips through Markdown.
