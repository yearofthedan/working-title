# 4. Method as data

Status: Accepted, 2026-10-04

## Context

The app is built on one writing method now, and others may follow. Options: hard-code the method, or describe a method as data read by a generic engine.

## Decision

A method is a declarative definition of piece types, the facets each carries, and stages, each with its dependencies and guidance. A generic engine reads it; the code never names a method. Each project records its method and version.

## Consequences

Method vocabulary appears only in method definitions, enforced by lint. A toy method shaped differently from the built-in one must run through the engine unchanged, or the check proves nothing. Nothing is generalised beyond what the built-in method exercises.
