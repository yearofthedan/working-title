# TypeScript Guide

Type-safety standards for this project. `./do lint` enforces what it can; the rest is judgment.

## No `any`

Never use `any`. It silently switches off type-checking, so the mismatches it hides surface at runtime instead of compile time. Reach for a real type, `unknown` (then narrow with a guard), a test builder, or `never` — or ask. The type you actually want is almost always recoverable from the data shape.

## No type casting

Avoid `as SomeType`. A cast asserts a shape the compiler can't verify, hiding exactly the mismatches the type system exists to catch. Prefer type guards, discriminated unions, or fixing the source type. When a value is genuinely untyped, narrow from `unknown` with a guard rather than asserting.

## Path alias `@/*`

Import from `src/` via the `@/*` alias, not deep relative chains:

```ts
import { useProjectLoader } from '@/features/writing-project/composables/useProjectLoader'
// not: ../../../features/writing-project/composables/useProjectLoader
```

The alias is for readability only — it does not license cross-feature reach-ins. Feature isolation still holds (see [architecture.md](../architecture.md)).
