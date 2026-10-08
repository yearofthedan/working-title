# 10. AGENTS.md as the only agent guide

Status: Accepted, 2026-10-08

## Context

Dan builds with OMP and may use other agents. Options: a CLAUDE.md, tool-specific files, or one AGENTS.md.

## Decision

`AGENTS.md` at the repo root is the only agent guide; there is no `CLAUDE.md`. It imports `docs/communication-standards.md` and `docs/GLOSSARY.md` with `@` imports so they load at session start.

## Consequences

OMP loads `AGENTS.md` and expands `@` imports ([OMP context files](https://github.com/can1357/oh-my-pi/blob/main/docs/context-files.md)). Claude Code reads `AGENTS.md` only when no `CLAUDE.md` exists ([Claude Code memory](https://code.claude.com/docs/en/memory#agents-md)); whether it expands `@` imports inside `AGENTS.md` is unchecked. The repo stays tool-neutral.
