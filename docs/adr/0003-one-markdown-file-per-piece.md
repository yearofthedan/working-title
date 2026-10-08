# 3. One Markdown file per piece, in flat folders

Status: Accepted, 2026-10-04

## Context

The folder is the restore source, so it must be lossless, and it should be readable without the app. Options: one project file, .docx, Markdown nested by the tree, or one Markdown file per piece in flat folders by type.

## Decision

One Markdown file per piece, in flat folders by type. Structure (ID, type, parent, order) lives in frontmatter, never in folder paths or filenames. Links and chapters are separate files at the root.

## Consequences

The browser's file API has no reliable directory move, so flat folders keep restructuring cheap, and renames never break anything. The editor may offer only formatting that round-trips through Markdown.
