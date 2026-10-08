# 4. One Markdown file per piece, in flat folders

Status: Accepted, 2026-10-04

## Context

What shape does the writer's folder take?

- **Restore source.** The folder is the only copy outside the browser and the source for restoring it, so it must hold everything.
- **Readable.** Writers may open the files without the app, in any editor or a notes tool such as Obsidian.
- **Restructuring.** Pieces are restructured often: beats added and removed, scenes moved between beats.
- **File API.** The browser's file API has no reliable directory move.
- **Size.** A project is about 300 pieces, and a restore has to read all of them.

## Decision

One Markdown file per piece, in flat folders by type. Structure (ID, type, parent, order) lives in frontmatter, never in folder paths or filenames. Links and chapters are separate files at the root.

## Alternatives considered

| Option | Restore source | Readable | Restructuring | File API | Size |
| --- | --- | --- | --- | --- | --- |
| **Markdown per piece, flat folders (chosen)** | Structure in frontmatter | Yes | Frontmatter change only | No moves needed | 300 small reads |
| One project file (JSON) | Yes | No | Fine | Fine | Whole file rewritten each save |
| .docx | Can't hold the plan's structure | Yes | Fine | Hard to write from a browser | Fine |
| Markdown nested by the tree | Yes | Yes | Many files move | Copy-then-delete for every move | Fine |

## Consequences

The browser's file API has no reliable directory move, so flat folders keep restructuring cheap, and renames never break anything. The editor may offer only formatting that round-trips through Markdown.
