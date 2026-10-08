# 2. Browser working copy, mirrored to the writer's folder

Status: Accepted, 2026-10-04

## Context

With no server, where on the writer's machine does the work live, and which copy is the one the app trusts?

- Words are never lost: the first design principle. A crash may lose at most about 2 seconds of typing.
- Every keystroke must render within a frame. File writes from a browser are asynchronous and much slower than that.
- Browsers can clear site storage, through the writer or under storage pressure.
- Writers expect to own their files and open them in other tools.
- With no backend ([ADR 1](0001-no-backend-in-v1.md)), everything lives on the writer's machine.
- Writable folder access from a web app exists only in desktop Chromium (File System Access API); Mozilla rates it harmful and WebKit has declined it. Access must be re-granted by a user click after each reload.

## Decision

Browser storage is the working copy. A background mirror writes each changed piece to a folder the writer picks, through the File System Access API. When browser storage is empty, the project is restored from the folder; otherwise browser storage wins. The mirror is write-only in v1.

## Alternatives considered

- **The folder as the only store.** Lost on the first two forces: saves would wait on slow file writes, and nothing could be saved after a reload until the writer clicks to re-grant access.
- **Browser storage only.** Lost on the third and fourth forces: cleared site data would lose everything, and the writer would own no copy.
- **A native shell (Tauri) now.** Lost on the first force of [ADR 1](0001-no-backend-in-v1.md): a native app to build, sign and ship on every OS is more than one person should take on for v1.

## Consequences

Typing never waits on the file system. The File System Access API exists only in desktop Chromium, so v1 runs there; other browsers are told up front that they can't keep work in a folder. Folder access needs a user click after every reload, so the app offers a reconnect action and shows when the folder is disconnected. Edits made to the files outside the app are not read back.
