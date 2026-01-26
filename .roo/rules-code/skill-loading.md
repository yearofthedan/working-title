# Code Mode Skill Loading

## On Task Start or Mode Switch

When starting a task or receiving a handover from another mode, you MUST:

### 1. Check for Relevant Skills

Review [`.roo/skills/README.md`](../skills/README.md) to identify applicable workflows for your task.

### 2. Load Skills Based on Task Type

**For any code changes:**
- [`workflow-general`](../skills/workflow-general/SKILL.md) - ALWAYS load first (./do scripts, linting, commits)

**For feature development:**
- [`workflow-functional-changes`](../skills/workflow-functional-changes/SKILL.md) - Vertical slicing, TDD, testing

**For Vue components:**
- [`workflow-vue-components`](../skills/workflow-vue-components/SKILL.md) - Component patterns, Tailwind, Storybook

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
read_file: .roo/skills/workflow-vue-components/SKILL.md
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
Load workflow-vue-components
  ↓
Done - proceed with task
```

## Skill Loading Checklist

Before starting any code work:

- [ ] Check skills README for relevant workflows
- [ ] Load workflow-general (always for code changes)
- [ ] Load task-specific skills (features, components, dependencies)
- [ ] Verify skills are now in context
