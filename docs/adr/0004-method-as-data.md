# 4. Method as data

Status: Accepted, 2026-10-04

## Context

How does the code know the writing method: written into the code, or read from a definition?

- **More methods.** The app starts with one method, Snowflake, extended, and writers use others.
- **Writer decides.** "Method offers, writer decides" is a design principle, and changing the flow is a likely later feature.
- **Tuning.** Each stage's guidance and prompts will be reworded many times while the method is tuned.
- **Agents copy.** Agents copy what they see: method words in core code spread fast.

## Decision

A method is a declarative definition of piece types, the facets each carries, and stages, each with its dependencies and guidance. A generic engine reads it; the code never names a method. Each project records its method and version.

## Alternatives considered

| Option | More methods | Writer decides | Tuning | Agents copy |
| --- | --- | --- | --- | --- |
| **Method as data (chosen)** | New definition, no code | Flow is data the writer could change later | Edit the definition | Lint keeps method words out of the core |
| Snowflake written into the code | Rewrite | Code change | Code change | Method words everywhere |

## Consequences

Method vocabulary appears only in method definitions, enforced by lint. A toy method shaped differently from the built-in one must run through the engine unchanged, or the check proves nothing. Nothing is generalised beyond what the built-in method exercises.
