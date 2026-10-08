# 3. Browser working copy, mirrored to the writer's folder

Status: Accepted, 2026-10-04

## Context

With no server, where on the writer's machine does the work live, and which copy is the one the app trusts?

- **Words never lost.** The first design principle. A crash may lose at most about 2 seconds of typing.
- **Instant typing.** Every keystroke must render within a frame. File writes from a browser are asynchronous and much slower than that.
- **Cleared storage.** Browsers can clear site storage, through the writer or under storage pressure.
- **Ownership.** Writers expect to own their files and open them in other tools.
- **Folder access.** With no backend ([ADR 1](0001-no-backend-in-v1.md)), work lives on the writer's machine. Writable folder access from a web app exists only in desktop Chromium (File System Access API); Mozilla rates it harmful and WebKit has declined it. Access must be re-granted by a user click after each reload.

## Decision

Browser storage is the working copy. A background mirror writes each changed piece to a folder the writer picks, through the File System Access API. When browser storage is empty, the project is restored from the folder; otherwise browser storage wins. The mirror is write-only in v1.

## Alternatives considered

| Option | Words never lost | Instant typing | Cleared storage | Ownership | Folder access |
| --- | --- | --- | --- | --- | --- |
| **Browser copy, mirrored to folder (chosen)** | Saves locally within a second | Typing never waits on files | Restore from folder | Readable folder | Chromium only; reconnect after reload |
| Folder as the only store | Nothing saved until access is re-granted | Every save waits on a file write | Fine | Fine | Chromium only, and blocks saving |
| Browser storage only | Fine | Fine | Everything lost | No copy | Not needed |
| Native shell (Tauri) now | Fine | Fine | Fine | Fine | Every OS, but a native app to build and ship |

## Consequences

Typing never waits on the file system. The File System Access API exists only in desktop Chromium, so v1 runs there; other browsers are told up front that they can't keep work in a folder. Folder access needs a user click after every reload, so the app offers a reconnect action and shows when the folder is disconnected. Edits made to the files outside the app are not read back.
