# 6. Vite+ as the toolchain

Status: Proposed, 2026-10-10

## Context

Which tools format, lint, type-check and test the code, and run the git hooks?

- **Structural checks.** Dependency direction, domain purity and the ban on method words in the core are lint rules ([ADR 2](0002-hexagonal-layers.md), [ADR 5](0005-method-as-data.md)), so the linter must express restricted imports and globals per folder, and custom rules.
- **Agents copy.** Agents write most of the code: every extra config and command is another pattern to copy wrongly.
- **Keeping in step.** Tools released separately are upgraded separately, and a version of one can break another.
- **Maturity.** A young tool can change under the code.
- **Lock-in.** Every test imports its runner, and every structural check is written for one linter, so leaving a toolchain costs more with each test and rule.

## Options considered

| Option | Structural checks | Agents copy | Keeping in step | Maturity | Lock-in |
| --- | --- | --- | --- | --- | --- |
| Vite+: Vite, Vitest, Oxlint, Oxfmt and hooks in one package | Restricted imports and globals per folder; custom rules as JS plugins, in [alpha](https://oxc.rs/docs/guide/usage/linter/js-plugins) | One config, one command | One version for all of them | 1.x | Tests import `vite-plus/test`; rules are Oxlint's |
| Vite and Vitest, with ESLint, Prettier and a hook manager | Restricted imports, [eslint-plugin-boundaries](https://github.com/javierbrea/eslint-plugin-boundaries) and custom rules, all stable | Four configs | Four versions | Settled | Tests import `vitest`; rules are ESLint's, which Oxlint's JS plugins also run |
| Vite and Vitest, with Biome and a hook manager | Restricted imports and globals per folder; custom rules as [GritQL plugins](https://github.com/biomejs/website/blob/main/src/content/docs/en/linter/plugins.mdx) | Three configs | Three versions | 2.x | Tests import `vitest`; rules are Biome's |

## Decision

Vite+ formats, lints, type-checks and tests the code, and installs the git hooks, from one config. Structural checks are written for Oxlint, the linter inside it; a check about the import graph as a whole may use a dedicated tool beside it.

**Agents copy** and **Keeping in step** decided it: one config, one command and one version to move. The ESLint option leads on **Structural checks**, **Maturity** and **Lock-in**, and those weigh less now than they will: no custom rule is needed until the layers exist, and with few tests and no structural rules yet, leaving costs little. That is why the reversal point is named below, before the cost grows.

- **ESLint, Prettier and a hook manager** lost on **Agents copy** and **Keeping in step**: four configs and four versions to keep together, for checks Vite+ can also express. Its lead on **Structural checks** is decisive only where Oxlint cannot express a check.
- **Biome and a hook manager** lost on the same two columns. It leads Vite+ on **Maturity** but not ESLint, so if Vite+ is reversed, ESLint is the option to reverse to.

If the ban on method words or the import rules cannot be written reliably for Oxlint, when the layers first need them, ESLint is the better choice and this record is superseded.

## Consequences

`./do check` is the one local check. Upgrades move the whole toolchain at once. A custom lint rule depends on Oxlint's JS plugins until they leave alpha. Leaving Vite+ means rewriting the lint config, each structural rule and each test's imports, and that cost grows with every one written.
