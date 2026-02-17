# Project Structure Cleanup

## Overview

Consolidate project knowledge, simplify agent workflows, and reduce token usage by reorganizing documentation, rules, and source code structure. This implements the findings from the February 2026 project structure review.

## Goals

- [ ] Single source of truth for project knowledge in `docs/`
- [ ] Ultra-thin auto-loaded rules (~25 lines total vs current ~170)
- [ ] Leaner skills that point to documentation rather than duplicating it
- [ ] Clear separation: Vue logic in `features/`, everything else is pure TypeScript
- [ ] Reduced nesting and naming redundancy in source code
- [ ] Documented structural conventions for agent decision-making

## Guiding Principles

### Discovered During Review

1. **Composables are a technique, not a category.** They live with the concern they serve.
2. **`features/` owns all Vue logic.** Everything outside is pure TypeScript.
3. **`infra/` is framework-agnostic.** No Vue imports. Vue adapters live in features.
4. **Test co-location**: PageObjects next to components. Shared builders in `__testHelpers__/` at nearest common ancestor.
5. **Skills = imperative procedures.** Docs = reference knowledge.
6. **Rules = auto-loaded constraints + terminology.** Full explanations in `docs/`.

These principles should be captured in `docs/architecture.md` under "Structural Conventions."

## Implementation Phases

### Phase 1: Documentation Consolidation

**Goal**: Create `docs/` as the single knowledge tree.

#### Task 1.1: Create docs structure and entry point

**Files to create:**

- `docs/README.md` — Progressive disclosure index ("Start here")
- `docs/guides/` — Directory for extracted skill content

**Acceptance criteria:**

- [ ] `docs/README.md` exists with clear sections: Context, Decisions, Planning, Guides
- [ ] Links to major areas (architecture, domain, decisions, planning, guides)
- [ ] Explains when to read each area

#### Task 1.2: Move memory/ → docs/

**Files to move:**

- `memory/decisions/` → `docs/decisions/`
- `memory/planning/` → `docs/planning/`
- `memory/README.md` → delete (content absorbed into `docs/README.md`)

**Files to update:**

- All internal links in moved files (update relative paths)
- `AGENTS.md` — update references from `memory/` to `docs/`

**Acceptance criteria:**

- [ ] `memory/` directory deleted
- [ ] All ADRs accessible via `docs/decisions/index.md`
- [ ] All planning docs accessible via `docs/planning/`
- [ ] No broken links in moved files
- [ ] `AGENTS.md` updated

#### Task 1.3: Extract full project context to docs/

**Files to create (content from `.roo/rules/`):**

- `docs/architecture.md` — Full version from `.roo/rules/architecture.md` PLUS new "Structural Conventions" section with the 7 principles above
- `docs/domain.md` — Full version from `.roo/rules/domain.md`
- `docs/domain-implementation.md` — Full version from `.roo/rules/domain-implementation.md`
- `docs/tech-stack.md` — Full version from `.roo/rules/tech-stack.md`

**Acceptance criteria:**

- [ ] Each docs file is comprehensive (includes all content from rules version)
- [ ] `docs/architecture.md` includes new "Structural Conventions" section
- [ ] Original `.roo/rules/` files NOT modified yet (that's Phase 2)

#### Task 1.4: Extract skill references to docs/guides/

**Files to create:**

- `docs/guides/icons.md` — Content from `.roo/skills/icon-system/SKILL.md`
- `docs/guides/i18n.md` — Content from `.roo/skills/i18n-workflow/SKILL.md`
- `docs/guides/tdd-patterns.md` — Examples and anti-patterns from `.roo/skills/tdd-enforcement/SKILL.md` and references
- `docs/guides/vue-testing.md` — Content from `.roo/skills/workflow-vue/references/testing.md`
- `docs/guides/vue-composables.md` — Content from `.roo/skills/workflow-vue/references/composables.md`
- `docs/guides/vue-styling.md` — Content from `.roo/skills/workflow-vue/references/styling.md`

**Acceptance criteria:**

- [ ] All guide files created with complete content
- [ ] Original skill files NOT deleted yet (that's Phase 2)
- [ ] `docs/README.md` updated to list guides

---

### Phase 2: Rules and Skills Thinning

**Goal**: Make `.roo/rules/` ultra-thin dispatchers, retire redundant skills.

#### Task 2.1: Slim down rules to dispatchers

**Files to modify:**

**`.roo/rules/architecture.md`** — Replace with:

```markdown
# Architecture

Load [docs/architecture.md](../../docs/architecture.md) before making structural decisions.
Principles: Domain-Driven Design | UI-Centric Canvas | User Data Ownership
Hard constraints: No cross-feature imports. Async loading for heavy deps.
```

**`.roo/rules/domain.md`** — Replace with:

```markdown
# Domain

Load [docs/domain.md](../../docs/domain.md) for full context.
Always apply these term meanings:
| Step = writing task | Template = methodology | Canvas = graph editor |
| Track = layout column | Connection = narrative link | Node = visual step |
| Stage = progress indicator (1,2,3) |
```

**`.roo/rules/tech-stack.md`** — Replace with:

```markdown
# Tech Stack

Vue 3 + TypeScript + Vite + pnpm.
Load [docs/tech-stack.md](../../docs/tech-stack.md) for full library list and versions.
```

**Files to delete:**

- `.roo/rules/domain-implementation.md` — now lives only in `docs/`

**Acceptance criteria:**

- [ ] Each rule file is ~5-15 lines
- [ ] Each rule includes pointer to full doc
- [ ] Total auto-loaded rule content ~25 lines (vs ~170 before)

#### Task 2.2: Trim skills and update references

**Files to modify:**

**`.roo/skills/workflow-vue/SKILL.md`** — Remove inline reference content, add pointers to `docs/guides/vue-*.md`

**`.roo/skills/tdd-enforcement/SKILL.md`** — Keep principle (~30 lines), remove examples section, add pointer to `docs/guides/tdd-patterns.md`

**Delete references folders:**

- `.roo/skills/workflow-vue/references/` — content now in `docs/guides/`
- `.roo/skills/tdd-enforcement/references/` — content now in `docs/guides/`

**Acceptance criteria:**

- [ ] Modified skills point to docs guides
- [ ] Reference folders deleted
- [ ] Skills remain focused on procedure, not reference

#### Task 2.3: Retire redundant skills

**Files to delete:**

- `.roo/skills/understand-architectural-decisions/` — replaced by `docs/decisions/index.md`
- `.roo/skills/icon-system/` — replaced by `docs/guides/icons.md`
- `.roo/skills/i18n-workflow/` — replaced by `docs/guides/i18n.md`

**Files to update:**

- `.roo/skills/README.md` — Remove retired skills from catalog
- Any skills that reference retired skills — update to point to docs

**Acceptance criteria:**

- [ ] Retired skill folders deleted
- [ ] No broken skill references
- [ ] `docs/guides/` provides equivalent content

---

### Phase 3: Source Code Reorganization

**Goal**: Clear separation (Vue in `features/`, pure TS elsewhere), reduced nesting.

#### Task 3.1: Merge i18n + locales

**Files to move:**

- `src/locales/en.json` → `src/i18n/en.json`
- `src/locales/en.spec.ts` → `src/i18n/en.spec.ts`
- `src/locales/types.ts` → `src/i18n/types.ts`

**Files to update:**

- All imports from `@/locales/*` → `@/i18n/*`
- `src/i18n/index.ts` — update relative import from `../locales/en.json` → `./en.json`

**Files to delete:**

- `src/locales/` directory

**Acceptance criteria:**

- [ ] `src/locales/` deleted
- [ ] All i18n files in `src/i18n/`
- [ ] All imports updated
- [ ] `./do test` passes

#### Task 3.2: Redistribute composables to features

**Files to move:**

- `src/composables/useNotifications.ts` → `src/features/common/feedback/useNotifications.ts`
- `src/composables/useNotifications.spec.ts` → `src/features/common/feedback/useNotifications.spec.ts`
- `src/composables/useLogger.ts` → `src/features/common/useLogger.ts`
- `src/composables/useLogger.spec.ts` → `src/features/common/useLogger.spec.ts`
- `src/composables/useAsyncState.ts` → `src/features/common/composables/useAsyncState.ts`
- `src/composables/useDebouncedEmit.ts` → `src/features/common/composables/useDebouncedEmit.ts`
- `src/composables/useDebouncedEmit.spec.ts` → `src/features/common/composables/useDebouncedEmit.spec.ts`

**Files to update:**

- All imports from `@/composables/*` → new locations
- Path aliases if needed

**Files to delete:**

- `src/composables/` directory

**Acceptance criteria:**

- [ ] `src/composables/` deleted
- [ ] All imports updated
- [ ] `./do test` passes
- [ ] `./do build` passes

#### Task 3.3: Trim feature prefixes

**Directories to rename:**

- `src/features/writing-project/project-canvas/` → `src/features/writing-project/canvas/`
- `src/features/writing-project/project-canvas/canvas-step/` → `src/features/writing-project/canvas/step/`
- `src/features/writing-project/project-sidebar/` → `src/features/writing-project/sidebar/`

**Files to update:**

- All imports referencing renamed directories
- Path references in tests and stories

**Acceptance criteria:**

- [ ] Directories renamed
- [ ] All imports updated
- [ ] `./do test` passes
- [ ] `./do storybook` builds without errors

---

### Phase 4: Test Helper Flattening (Optional/Incremental)

**Goal**: Remove single-file `__testHelpers__/` folders, co-locate PageObjects.

**Approach**: This can be done incrementally per feature. Not blocking for overall cleanup.

**Pattern to apply:**

- If `__testHelpers__/` contains only a PageObject → move PageObject next to component, delete folder
- If `__testHelpers__/` contains shared builders/fixtures → keep folder

**Files to evaluate** (examples):

- `src/features/writing-project/canvas/step/__testHelpers__/CanvasStepPageObject.ts` (single file)
- `src/features/writing-project/__testHelpers__/WritingProjectPageObject.ts` (single file)
- `src/features/writing-project/canvas/__testHelpers__/` (has builders + PageObjects — keep)

**Acceptance criteria (per component):**

- [ ] Single-file `__testHelpers__/` removed
- [ ] PageObject co-located with component
- [ ] Imports updated
- [ ] Tests pass

---

## Definition of Done (Overall)

- [ ] `docs/` is the single source of project knowledge
- [ ] `docs/README.md` provides clear navigation
- [ ] `memory/` directory deleted
- [ ] `.roo/rules/` files are ~5-15 lines each (dispatchers only)
- [ ] 3 skills retired, content available in `docs/guides/`
- [ ] `src/composables/` deleted, composables redistributed
- [ ] `src/locales/` deleted, merged into `src/i18n/`
- [ ] Feature prefixes trimmed (`project-canvas` → `canvas`)
- [ ] All tests pass (`./do test`)
- [ ] Build succeeds (`./do build`)
- [ ] Storybook builds (`./do storybook`)
- [ ] `AGENTS.md` updated to reflect new structure
- [ ] `docs/PROJECT_STRUCTURE.md` updated to reflect new structure

## Technical Notes

### Import Path Updates Required

Phase 3 will require updating imports across the codebase:

- `@/composables/*` → various new locations in `@/features/common/`
- `@/locales/*` → `@/i18n/*`
- `@/features/writing-project/project-*` → `@/features/writing-project/*` (trimmed prefixes)

Recommend using find-and-replace carefully or IDE refactoring tools.

### Verification Commands

After each phase:

```bash
./do lint
./do build
./do test
```

### Rollback Strategy

Each phase is self-contained. If issues arise:

- Phase 1: Revert docs/, restore memory/, revert AGENTS.md
- Phase 2: Restore .roo/rules/ and .roo/skills/ from backup
- Phase 3: Revert file moves and import updates

Commit after each phase completes successfully.

## Out of Scope

- Refactoring component internal structure
- Adding new features or tests
- Modifying ADR content (only moving files)
- Changing test framework or tooling
