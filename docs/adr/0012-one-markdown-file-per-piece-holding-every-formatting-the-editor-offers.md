# 12. One Markdown file per piece, holding every formatting the editor offers

Status: Proposed, 2026-11-13

## Context

What shape does the writer's folder take, now that it is the project ([ADR 11](0011-the-writers-folder-is-the-project.md))?

- **Source.** The folder is the project and is read on every open, so it must hold everything: every piece, the project's own fields, links and chapters.
- **Formatting.** The novel decides which formatting it needs; the files must keep each one exactly.
- **Readable.** Writers open the files in any editor or a notes tool such as Obsidian, and edit them there.
- **Restructuring.** Pieces are restructured often: beats added and removed, scenes moved between beats.
- **File API.** The browser's file API has no reliable directory move.
- **Size.** A project is about 300 pieces, and every open reads all of them.

## Options considered

| Option | Source | Formatting | Readable | Restructuring | File API | Size |
| --- | --- | --- | --- | --- | --- | --- |
| Markdown per piece, flat folders | Structure in frontmatter; a project file at the root | Standard Markdown, plus a documented extension where it has none | Yes; extension syntax shows as markup elsewhere | Frontmatter change only | No moves needed | 300 small reads |
| One project file (JSON) | Yes | Any | No | Fine | Fine | Whole file rewritten each save |
| .docx | Can't hold the plan's structure | Any | Yes | Fine | Hard to write from a browser | Fine |
| Markdown nested by the tree | Yes | As the first row | Yes | Many files move | Copy-then-delete for every move | Fine |

## Decision

One Markdown file per piece, in flat folders by type. Structure (ID, type, parent, order) lives in frontmatter, never in folder paths or filenames. A project file at the root holds the project's own fields, such as its title, method and version, and marks the folder as a novel. Links and chapters are separate files at the root. The files hold every formatting the editor offers, exactly: where standard Markdown has no syntax for one, a documented extension holds it, chosen by the story that first offers it.

Source and Formatting decided it, with Readable. JSON holds everything but can't be read or edited by hand. .docx can't hold the plan's structure. Nesting by the tree makes every restructure a file move the API can't do reliably. Readable favours standard Markdown alone, but Formatting outweighs it: the novel's formatting is the product, and other editors are a convenience that still shows every word.

## Consequences

The editor decides the formatting, and the files follow. Formatting beyond standard Markdown shows as markup in other editors. Text the app can't show, such as a table typed in another editor, is kept exactly as written. Renaming a piece or the novel never moves a file. Every open reads about 300 files. Supersedes [ADR 4](0004-one-markdown-file-per-piece.md).
