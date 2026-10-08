# 2. Browser working copy mirrored to a folder

Status: Accepted, 2026-10-04

## Context

Typing has to stay under one frame and a crash may lose at most about 2 seconds, while the writer's work also has to survive cleared browser data. With no backend ([ADR 11](0011-no-backend-in-v1.md)), the options are the folder as the only store, or browser storage as the working copy with the folder as a mirror.

## Decision

IndexedDB (via Dexie) is the working copy, saved about 1 second after a typing pause and immediately on blur, tab switch or close. A background mirror writes changed pieces to the writer's folder about 2 seconds after a pause and at least every 10 seconds while typing. When browser storage is empty, the project is restored from the folder; otherwise browser storage wins. The mirror is write-only in v1. The app requests persistent storage.

## Consequences

Folder access needs a user click after every reload, so the app offers an explicit reconnect action and shows when the folder is disconnected. Edits made to the files outside the app are not read back.
