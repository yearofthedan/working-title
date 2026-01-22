---
name: workflow-third-party-libraries
description: Guidance for selecting, installing, and auditing npm dependencies with a focus on bundle size and security.
---

# Add Dependency

Systematically evaluate and add external npm dependencies while minimizing bundle bloat and security risks.

## Procedure

### 1. Evaluate Necessity

Ask: Can this be solved with native code?

- Native First: Use native ES6+ (e.g., fetch, Array methods) or existing project utilities.
- Cost: Every dependency increases the maintenance burden and security surface area.

### 2. Research & Thresholds

Use bundlephobia.com to check the impact before installing.

- < 50KB: Standard import.
- 50KB - 1MB: Evaluate necessity; consider code-splitting.
- \> 1MB: Requires Async/Dormant patterns ([Vue component performance patterns](../workflow-vue-components/references/performance.md))

Criteria: Prioritize libraries that are tree-shakeable, actively maintained (updated within 12 months), and have native TypeScript support.

### 3. Security & Installation

1. Audit: Run `./do audit` before finalizing. Critical vulnerabilities require an alternative package.
2. Install: Use pnpm add package-name (or -D for build-only tools).
3. Verify: Ensure pnpm-lock.yaml is updated and the package is in the correct section of package.json.

## Validation Checklist

- [ ] Native solution is not viable?
- [ ] Bundle size verified on Bundlephobia?
- [ ] Heavy dependencies (>1MB) use Async/Dormant patterns?
- [ ] Security audit passed (./do audit)?
- [ ] Installed in correct category (dependencies vs devDependencies)?
- [ ] License is compatible (MIT/Apache)?

## Common Mistakes

- Dev Tools in Runtime: Installing testing or build utilities without the -D flag.
- Duplicate Logic: Installing a library for a feature that VueUse or an existing utility already provides.
- Ignoring Tree-Shaking: Importing an entire library when only one function is needed.
