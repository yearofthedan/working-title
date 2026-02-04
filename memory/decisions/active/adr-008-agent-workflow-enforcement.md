# ADR-008: Agent Workflow Enforcement

**Status**: Active  
**Date**: 2026-02-04  
**Context**: Notification Display System implementation revealed systematic agent workflow violations

## Problem

During the Notification Display System implementation (orchestrated from Q&A → Code mode), multiple critical workflow violations occurred:

1. **Orchestrator Protocol Violation**: Auto-chained subtasks without waiting for user approval
2. **Missing Skill Loading**: Code mode didn't load required skills, leading to:
   - Raw Tailwind colors instead of semantic tokens
   - Hardcoded strings instead of i18n
   - Missing TDD cycle
   - Accessibility violations
3. **User Directive Ignored**: User said "talk to me instead of guessing" but agent proceeded with implementation
4. **Silent Failures**: UI component worked but notification triggers were never tested/implemented

**Root Cause**: Existing rules (`.roo/rules-orchestrator/workflow.md`, `.roo/rules-code/skill-loading.md`) documented correct protocols, but enforcement was too soft. Agents could miss or ignore instructions without clear violation detection.

## Decision

Strengthen workflow enforcement with explicit violation checks, mandatory checklists, and anti-pattern detection.

### Changes Made

#### 1. Enhanced Orchestrator Protocol (`.roo/rules-orchestrator/workflow.md`)

**Before**: "STOP and WAIT" instruction
**After**: 
- Explicit violation check before each subtask
- Real failure example showing consequences
- Mandatory skill handover protocol with verification steps

**Key Addition**:
```markdown
**VIOLATION CHECK**: Before starting any new subtask, ask yourself:
- "Did the user explicitly say 'continue', 'next', or 'proceed'?"
- If NO → STOP. Use `attempt_completion` and wait.
```

#### 2. Strengthened Skill Loading (`.roo/rules-code/skill-loading.md`)

**Before**: Instructions to "check and load" skills
**After**:
- Reference to mandatory pre-implementation checklist
- Anti-pattern detection section with specific red flags
- Expanded checklist with all relevant skills

**Key Addition**:
```markdown
**RED FLAGS** that indicate you skipped skill loading:
- Using raw Tailwind colors (e.g., `bg-blue-500`)
- Hardcoded strings instead of i18n
- Missing TDD cycle
```

#### 3. New Pre-Implementation Checklist (`.roo/rules-code/pre-implementation-checklist.md`)

**Purpose**: Single comprehensive checklist covering all pre-coding requirements

**Structure**:
- Phase 1: Context Loading (load all relevant skills)
- Phase 2: Implementation Strategy (ask vs. implement decision)
- Phase 3: TDD Setup (write failing test first)
- Phase 4: Standards Verification (confirm understanding)

**Impact**: Provides Code mode with clear gate before ANY implementation starts.

#### 4. New TDD Enforcement Skill (`.roo/skills/tdd-enforcement/SKILL.md`)

**Purpose**: Detailed RED-GREEN-REFACTOR cycle for features with user feedback

**Key Sections**:
- When to use TDD (notifications, forms, navigation)
- Step-by-step failing test → implementation → refactor cycle
- Real example from notification feature showing wrong vs. right approach
- Anti-pattern detection for TDD violations

**Why a Skill**: TDD is a learned workflow pattern that benefits from progressive disclosure. Not always needed, so shouldn't bloat always-loaded rules.

#### 5. Updated Skills README (`.roo/skills/README.md`)

**Change**: Added `tdd-enforcement`, `i18n-workflow`, and `icon-system` to visible skill list with clearer descriptions.

## Rationale

### Why Strengthen Rather Than Rewrite

The existing rules were **architecturally correct** - they documented the right protocols. The problem was **enforcement**, not design.

**Strengthening approach**:
- Adds violation checks and anti-pattern detection
- Preserves existing good structure
- Makes implicit assumptions explicit
- Provides concrete examples of failures

### Why Add Pre-Implementation Checklist

Checklist pattern is proven effective for complex multi-step processes (aviation, surgery, software deployment).

**Benefits**:
- Single source of truth for pre-coding gates
- Prevents "I forgot to check X" failures
- Clear stopping points before damage occurs
- Easy to verify compliance

### Why Create TDD Enforcement Skill

**Why not a rule?**
- TDD is workflow-specific, not universal (not needed for docs, config, etc.)
- Benefits from detailed examples and progressive disclosure
- Fits skill pattern: loaded on-demand when relevant

**Why needed at all?**
- Notification feature had perfect UI but broken triggers (silent failure)
- Root cause: No test verifying composables actually called `success()`
- TDD would have caught this immediately

### Why Not Add QA Spec Quality Rules

User rejected this addition. Likely reasons:
- Q&A mode specs are already comprehensive (notification-display-spec.md is excellent)
- Problem was Code mode not loading skills, not spec quality
- Adding more QA rules doesn't fix the downstream enforcement problem

## Consequences

### Positive

- **Clearer violation detection**: Agents have explicit checks before dangerous actions
- **Earlier failure**: Violations caught at planning stage, not after implementation
- **Concrete examples**: Real failure case documented prevents repeat mistakes
- **Skill discoverability**: Updated README makes skill catalog more visible

### Negative

- **More reading**: Code mode now has longer startup checklist
- **Possible overcorrection**: Some simple tasks may feel over-gated

### Mitigation

- Checklist is frontloaded, so quick scan identifies relevant sections
- Anti-pattern detection helps catch violations mid-flight
- Skills remain optional/on-demand, preventing context bloat

## Validation

To verify effectiveness, monitor future workflows for:

1. **Orchestrator compliance**: Does orchestrator wait for "continue" before next subtask?
2. **Skill loading**: Does Code mode load skills before implementation?
3. **TDD adherence**: Are failing tests written before feature implementation?
4. **Standard compliance**: Are semantic tokens, i18n, accessibility standards followed?

If violations persist, escalate enforcement:
- Add mode-level constraints (e.g., fileRegex restrictions)
- Create automated linting/validation scripts
- Consider skill loading as mode initialization requirement

## References

- [Orchestrator Workflow](.roo/rules-orchestrator/workflow.md) - Updated protocol
- [Code Skill Loading](.roo/rules-code/skill-loading.md) - Enhanced enforcement
- [Pre-Implementation Checklist](.roo/rules-code/pre-implementation-checklist.md) - New gate
- [TDD Enforcement Skill](.roo/skills/tdd-enforcement/SKILL.md) - New workflow skill
- [Notification Display Spec](../planning/active/notification-display-spec.md) - Original feature that revealed violations
