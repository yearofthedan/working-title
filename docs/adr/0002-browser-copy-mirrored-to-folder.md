# 2. Browser working copy, mirrored to the writer's folder

Status: Accepted, 2026-10-04

## Context

With no backend ([ADR 1](0001-no-backend-in-v1.md)), work lives on the writer's machine. It has to survive a crash and cleared browser data, and the writer should own a readable copy. Options: the folder as the only store, browser storage only, or browser storage as the working copy with the folder as a mirror.

## Decision

Browser storage is the working copy. A background mirror writes each changed piece to a folder the writer picks, through the File System Access API. When browser storage is empty, the project is restored from the folder; otherwise browser storage wins. The mirror is write-only in v1.

## Consequences

Typing never waits on the file system. The File System Access API exists only in desktop Chromium, so v1 runs there; other browsers are told up front that they can't keep work in a folder. Folder access needs a user click after every reload, so the app offers a reconnect action and shows when the folder is disconnected. Edits made to the files outside the app are not read back.
