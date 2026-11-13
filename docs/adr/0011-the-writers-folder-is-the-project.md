# 11. The writer's folder is the project

Status: Proposed, 2026-11-13

## Context

Which copy of the writer's work does the app trust: the browser's, or the folder they chose?

- **Words never lost.** The first design principle. A crash may lose at most about 2 seconds of typing, and nothing the writer wrote anywhere is overwritten unasked.
- **Instant typing.** Every keystroke renders within a frame; file writes from a browser are asynchronous and slower than that.
- **Cleared storage.** Browsers can clear site storage, through the writer or under storage pressure.
- **Ownership.** Writers open their files in other tools, such as Obsidian, and may keep the folder in a synced drive.
- **Folder access.** Writable folder access exists only in desktop Chromium, through the File System Access API. Access lapses when the last tab closes unless the writer allows it on every visit or has installed the app ([persistent permissions](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api)).

## Options considered

| Option | Words never lost | Instant typing | Cleared storage | Ownership | Folder access |
| --- | --- | --- | --- | --- | --- |
| Folder is the project; browser holds unwritten edits | Edits saved in the browser first; a piece changed in both places keeps both | Typing never waits on files | Reopen from the folder, the same path as every open | Edits made outside the app are picked up | Chromium only; edits wait in the browser while access lapses |
| Browser copy, mirrored write-only to the folder | Edits made outside the app are overwritten on the next save | Typing never waits on files | Restore from the folder, a path run only after a loss | Files are readable, but edits to them are lost | Chromium only; edits wait in the browser while access lapses |
| Folder as the only store | Nothing saved while access has lapsed | Every save waits on a file write | Fine | Fine | Saving blocks until access is granted |
| Native shell now | Fine | Fine | Fine | Fine | Every OS, but a native app to build and ship |

## Decision

The folder the writer chooses is the project. Every change is saved in the browser first and written to the folder in the background. On opening, and when the writer returns to the app, the app reads the folder. Per piece, an edit the browser has not yet written wins; otherwise the folder wins. A piece changed in both places since the last write keeps both versions, and the writer is told.

Words never lost decided it. The write-only mirror lost on that force, because it overwrites edits made outside the app; the folder as the only store lost on it too, because it saves nothing while access has lapsed. A native shell meets every force, but a second app to build and ship is what [ADR 1](0001-no-backend-in-v1.md)'s solo builder rules out for v1.

## Consequences

The writer's files are the novel: what they change outside the app while it is closed or in the background comes back in. Opening and recovering are one path, so reading the folder runs on every open rather than only after a loss. The app keeps, per piece, what it last wrote, so it can tell its own writes from edits made outside it. Changes made to the files while the app is in front are not picked up. Other browsers are told up front that they can't keep work in a folder. Supersedes [ADR 3](0003-browser-copy-mirrored-to-folder.md).
