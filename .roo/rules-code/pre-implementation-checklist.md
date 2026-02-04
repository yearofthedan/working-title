# Pre-Implementation Checklist

**MANDATORY**: Before writing ANY implementation code, complete this checklist. This prevents common workflow violations.

## Phase 1: Context Loading (MUST COMPLETE FIRST)

- [ ] Read the specification document (usually in `memory/planning/active/`)
- [ ] Review acceptance criteria in spec
- [ ] Identify quality standards mentioned (Grade A accessibility, i18n, semantic tokens, etc.)
- [ ] Load [`workflow-general`](../skills/workflow-general/SKILL.md) - ALWAYS required for code changes
- [ ] Load [`workflow-functional-changes`](../skills/workflow-functional-changes/SKILL.md) - Required for features
- [ ] Load [`workflow-vue`](../skills/workflow-vue/SKILL.md) - Required for Vue components
- [ ] Load [`i18n-workflow`](../skills/i18n-workflow/SKILL.md) - If spec mentions user-facing text
- [ ] Load [`icon-system`](../skills/icon-system/SKILL.md) - If spec mentions icons
- [ ] Load [`storybook-workflow`](../skills/storybook-workflow/SKILL.md) - If creating/modifying components

**STOP**: If any relevant skill is unchecked, load it before proceeding.

## Phase 2: Implementation Strategy (PLAN BEFORE CODING)

- [ ] Identify the vertical slice to implement (smallest testable unit)
- [ ] Determine which files will be created/modified
- [ ] Check if user wants to be consulted before implementation starts
- [ ] If spec says "talk to me" or "ask before implementing" → **ASK USER** for direction
- [ ] If uncertain about approach → **ASK USER** rather than guessing

**Communication Check**: Did the user explicitly say:
- "Implement this now"
- "Go ahead and build it"
- "Start implementation"

If NO explicit implementation instruction → **ASK** what they want you to do first.

## Phase 3: TDD Setup (WRITE TESTS FIRST)

- [ ] Identified the behavior to test (from spec or vertical slice)
- [ ] Created/opened the test file (`.spec.ts`)
- [ ] Written a FAILING test that describes the expected behavior
- [ ] Executed test and confirmed it fails for the right reason
- [ ] Ready to write implementation code to make test pass

**RED-GREEN-REFACTOR RULE**: 
- ❌ Implementation code BEFORE failing test = VIOLATION
- ✅ Failing test → Implementation → Passing test = CORRECT

## Phase 4: Standards Verification

Review skills and confirm you understand:

- [ ] Tailwind semantic tokens (from workflow-vue) - NO raw colors like `bg-blue-500`
- [ ] i18n pattern (from i18n-workflow) - NO hardcoded user-facing strings
- [ ] Accessibility requirements (from workflow-vue) - Semantic HTML, ARIA labels
- [ ] Component structure (from workflow-vue) - Props/emits, < 60 lines target
- [ ] File organization (from workflow-general) - Correct feature directory

## Violation Detection

**If you catch yourself doing ANY of these, STOP IMMEDIATELY**:

- Writing implementation code without a failing test
- Using `bg-blue-500` or other raw Tailwind colors
- Hardcoding strings like `"Project deleted"` instead of `$t('project.deleted')`
- Skipping accessibility attributes (aria-label, role, semantic elements)
- Implementing without asking when user said "talk to me first"
- Auto-starting next subtask without user saying "continue"

## Quick Reference: When to Ask vs. When to Implement

**ASK the user when:**
- Spec is ambiguous or has gaps
- User said "talk to me" or "ask before implementing"
- You're uncertain about the approach
- Multiple valid implementation options exist
- Spec doesn't specify quality level clearly

**Proceed with implementation when:**
- Spec is comprehensive and clear
- User explicitly said "implement" or "build it"
- Skills clearly document the pattern to follow
- Acceptance criteria are unambiguous
- You've completed this entire checklist

## Final Pre-Flight Check

Before writing first line of code:

1. ✅ All relevant skills loaded and reviewed
2. ✅ Spec read and acceptance criteria clear
3. ✅ Test file created with failing test
4. ✅ User approved implementation start (or spec is clear enough)
5. ✅ Standards understood (semantic tokens, i18n, accessibility)

**ALL CHECKS MUST PASS** before proceeding to implementation.
