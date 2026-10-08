# 4. Method as data

Status: Accepted, 2026-10-04

## Context

The app is built on Snowflake, extended, but writers and later versions will want other methods. Options: hard-code Snowflake, or describe a method as data read by a generic engine.

## Decision

A method is a declarative definition of piece types, the facets each carries, and stages. Each stage elaborates (fills a facet) or branches (creates children), declares its dependencies and carries guidance. A generic engine reads it; the code never says "if Snowflake". Each project records its schema version and its method and version, with a migration hook for both.

## Consequences

A toy three-act method, shaped differently from Snowflake, must run through the engine with no code changes; otherwise the check is a rubber stamp. Method vocabulary appears only in method definitions. There is no method editor, and nothing is generalised beyond what Snowflake exercises.
