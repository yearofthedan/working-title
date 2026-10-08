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

## Consequences

The browser's file API has no reliable directory move, so flat folders keep restructuring cheap, and renames never break anything. The editor may offer only formatting that round-trips through Markdown.
