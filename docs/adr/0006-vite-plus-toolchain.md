# 6. Vite+ as the toolchain

Status: Proposed, 2026-10-10

## Context

Which tools format, lint, type-check and test the code, and run the git hooks?

- **Structural checks.** Dependency direction, domain purity and the ban on method words in the core are lint rules ([ADR 2](0002-hexagonal-layers.md), [ADR 5](0005-method-as-data.md)), so the linter must express restricted imports and globals per folder, and custom rules.
- **One build tool.** The app is built with Vite, and its tests run on Vitest.
- **Agents copy.** Agents write most of the code: fewer tools and configs leave fewer patterns to copy wrongly.
- **Maturity.** A young tool can change under the code; Oxlint's JS plugins, which custom rules use, are [alpha](https://oxc.rs/docs/guide/usage/linter/js-plugins).
- **Lock-in.** Tests import from the toolchain (`vite-plus/test`) and lint rules are written for its linter, so leaving it is real work.

## Options considered

| Option | Structural checks | One build tool | Agents copy | Maturity | Lock-in |
| --- | --- | --- | --- | --- | --- |
| Vite+ (Vite, Vitest, Oxlint, Oxfmt, hooks) | Restricted imports and globals with per-folder overrides; custom rules as JS plugins (alpha) | Same config as the build | One config, one command | 1.x | One package; each tool inside is usable alone |
| Vite and Vitest, with ESLint and Prettier, and a hook manager | Restricted imports, eslint-plugin-boundaries and custom rules, all stable | Separate configs | Four configs | Settled | Each tool replaceable alone |
| Vite and Vitest, with Biome, and a hook manager | Restricted imports and globals with overrides; custom rules in GritQL | Separate configs | Three configs | 2.x | Each tool replaceable alone |

## Decision

Vite+ formats, lints, type-checks and tests the code, and installs the git hooks, from one config. Structural checks are written for its linter, Oxlint; a check about the import graph as a whole may use a dedicated tool alongside it.

**Agents copy** and **One build tool** decided it: one config and one command, from the maintainers of the Vite and Vitest the stack is built on. The table favours ESLint on **Structural checks**, **Maturity** and **Lock-in**, and these weigh less than they look while the project is young: the first custom rule is not needed until the layers exist, the toolchain is expected to change, and leaving Vite+ rewrites config and test imports, not app code.

- **ESLint and Prettier** lost on **Agents copy** and **One build tool**: four configs and a hook manager to keep in step, for checks Vite+ can also express. Its lead is real only where Oxlint cannot express a check.
- **Biome** lost on the same two columns without ESLint's lead on the others: separate from Vite and Vitest, a hook manager besides, and custom rules in GritQL.

If the ban on method words or the import rules cannot be written reliably for Oxlint, ESLint is the better choice, and this record is superseded.

## Consequences

`./do check` is the one local check. Upgrades move the whole toolchain at once, from one `catalog` entry. A custom lint rule depends on Oxlint's JS plugins until they leave alpha. Leaving Vite+ means rewriting the lint config and the test imports, since its tools can each run alone.
