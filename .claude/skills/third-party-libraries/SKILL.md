---
name: third-party-libraries
description: Guidance for selecting, installing, and auditing npm dependencies with a focus on bundle size and security. Use before adding any external dependency.
---

# Add Dependency

Systematically evaluate and add external npm dependencies while minimizing bundle bloat and security risks.

## Procedure

### 1. Evaluate Necessity

Ask: can this be solved with native code?

- **Native first**: use native ES6+ (e.g. `fetch`, Array methods) or existing project utilities.
- **Cost**: every dependency increases maintenance burden and security surface area.

### 2. Research & Thresholds

Use [bundlephobia.com](https://bundlephobia.com) to check the impact before installing.

- **< 50KB**: standard import.
- **50KB – 1MB**: evaluate necessity; consider code-splitting.
- **> 1MB**: requires async / dormant loading — see [`docs/architecture.md`](../../../docs/architecture.md) (Performance: async loading) and [`adr-003-dormant-components`](../../../docs/decisions/active/adr-003-dormant-components.md).

Criteria: prefer libraries that are tree-shakeable, actively maintained (updated within 12 months), and have native TypeScript support.

### 3. Security & Installation

1. **Audit**: run `./do audit` before finalizing. Critical vulnerabilities require an alternative package.
2. **Install**: `pnpm add package-name@exact-version` (or `-D` for build-only tools). Pin exact versions and let Renovate manage updates.
3. **Verify**: `pnpm-lock.yaml` is updated and the package is in the correct section of `package.json`.

## Validation Checklist

- [ ] Native solution is not viable
- [ ] Bundle size verified on Bundlephobia
- [ ] Heavy dependencies (>1MB) use async / dormant patterns
- [ ] Security audit passed (`./do audit`)
- [ ] Installed in the correct category (`dependencies` vs `devDependencies`)
- [ ] License is compatible (MIT/Apache)

## Common Mistakes

- **Dev tools in runtime**: installing testing or build utilities without `-D`.
- **Duplicate logic**: installing a library for something VueUse or an existing utility already provides.
- **Ignoring tree-shaking**: importing an entire library when only one function is needed.
