# Code Mode Skill Loading

## MANDATORY Pre-Implementation Protocol

**CRITICAL**: Before writing a SINGLE line of implementation code, you MUST:

### Step 0: Complete Pre-Implementation Checklist

Review and complete **[Pre-Implementation Checklist](./pre-implementation-checklist.md)** - This is your primary workflow gate.

The checklist ensures you:
- Load all relevant skills
- Understand the spec requirements
- Write failing tests before implementation
- Get user approval when needed
- Understand project standards

**DO NOT SKIP THIS STEP.** The checklist prevents 90% of workflow violations.

### 1. Check for Relevant Skills

Review [`.roo/skills/README.md`](../skills/README.md) to identify applicable workflows for your task.

**If you received a mode switch or handover without pre-loaded skills, STOP and load them now.**

### 2. Load Skills Based on Task Type

**For any code changes:**
- [`workflow-general`](../skills/workflow-general/SKILL.md) - ALWAYS load first (./do scripts, linting, commits)

**For feature development:**
- [`workflow-functional-changes`](../skills/workflow-functional-changes/SKILL.md) - Vertical slicing, TDD, testing

**For Vue components and logic:**
- [`workflow-vue`](../skills/workflow-vue/SKILL.md) - Component and composable patterns, Tailwind, Storybook

**For adding dependencies:**
- [`workflow-third-party-libraries`](../skills/workflow-third-party-libraries/SKILL.md) - Bundle size, security audit

**For architecture questions:**
- [`understand-architectural-decisions`](../skills/understand-architectural-decisions/SKILL.md) - ADRs and design rationale

### 3. Load Skills into Context

Use `read_file` to load each relevant SKILL.md before starting work:

```markdown
# Example: Starting a Vue component feature
read_file: .roo/skills/workflow-general/SKILL.md
read_file: .roo/skills/workflow-functional-changes/SKILL.md
read_file: .roo/skills/workflow-vue/SKILL.md
```

### 4. Follow Loaded Skills

Apply the guidance from skills throughout your work. The skills contain critical project-specific patterns that differ from standard practices.

## Why This Matters

**Mode switching doesn't trigger skill discovery.** When you enter code mode mid-conversation:
- You inherit the previous mode's context
- Skills are NOT automatically scanned or loaded
- Without explicitly loading skills, you'll miss project-specific patterns
- This leads to inconsistent code and missed standards

## Quick Decision Tree

```
Starting a code task?
  ↓
Does it modify code?
  ↓ YES
Load workflow-general (always)
  ↓
Is it a new feature or significant change?
  ↓ YES
Load workflow-functional-changes
  ↓
Does it involve Vue components?
  ↓ YES
Load workflow-vue
  ↓
Done - proceed with task
```

## Skill Loading Checklist

**STOP. Before implementing ANYTHING, confirm:**

- [ ] Checked [`.roo/skills/README.md`](../skills/README.md) for relevant workflows
- [ ] Loaded [`workflow-general`](../skills/workflow-general/SKILL.md) (ALWAYS for code changes)
- [ ] Loaded [`workflow-functional-changes`](../skills/workflow-functional-changes/SKILL.md) (for features)
- [ ] Loaded [`workflow-vue`](../skills/workflow-vue/SKILL.md) (for Vue components)
- [ ] Loaded [`i18n-workflow`](../skills/i18n-workflow/SKILL.md) (if adding user-facing text)
- [ ] Loaded [`icon-system`](../skills/icon-system/SKILL.md) (if adding icons)
- [ ] Skills are now in context and reviewed

**If ANY box is unchecked and relevant, STOP. Load the skill first.**

## Anti-Pattern Detection

**RED FLAGS** that indicate you skipped skill loading:

- Using raw Tailwind colors (e.g., `bg-blue-500`) instead of semantic tokens (`bg-paper`)
- Hardcoded user-facing strings instead of i18n keys
- Missing TDD cycle (implementing before writing failing test)
- Implementing without referencing spec acceptance criteria
- Violating "Grade A" standards (ARIA, accessibility, semantic HTML)

**If you catch yourself doing ANY of the above, STOP and load the relevant skill.**
