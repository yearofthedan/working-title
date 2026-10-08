# 3. One Markdown file per piece, in flat folders

Status: Accepted, 2026-10-04

## Context

The mirror is the restore source, so it must be lossless, and it should be readable without the app. Options: a single project file; Markdown nested by the tree; .docx; or one Markdown file per piece in flat folders by type.

## Decision

Flat folders by type (`beats/`, `scenes/`, `cast/`), one file per piece named `slug--shortid.md`. Frontmatter holds ID, type, parent, order and the schema and method versions; each facet is a headed section. Prose is Markdown plus a small Pandoc-style extension (`[text]{.smallcaps}`, `:::` centred blocks); a mention is `[[Name|id]]`. `links.json` and `chapters.json` sit at the root; history sits in `history/`, one file per piece.

## Consequences

The browser's file API has no reliable directory move, so flat folders keep restructuring cheap. Filenames are for humans only, so renames and moves never break anything. The editor may offer only formatting that round-trips through this format; manuscript formatting is applied at export, never stored.
