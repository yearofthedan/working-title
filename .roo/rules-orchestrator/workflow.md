# Orchestrator Workflow Control

## Mode Switching and Skills

**Critical**: When switching modes in the same conversation thread, the new mode inherits existing context and does NOT re-scan for skills.

### Skill Handover Protocol (MANDATORY)

When delegating to another mode that should use skills, you MUST:

1. **Check spec requirements** - Review what standards the implementation must follow
2. **Identify relevant skills** from [`.roo/skills/`](../skills/) and [`.roo/skills/README.md`](../skills/README.md)
3. **Load skills into context** using `read_file` on EVERY applicable SKILL.md
4. **Verify skills loaded** - Confirm each skill file was read successfully
5. **Switch with explicit instruction** - Tell the target mode which skills to follow

**VIOLATION CHECK**: Before `switch_mode` or `new_task`, ask yourself:
- "What project standards must this implementation follow?" (i18n, Tailwind semantic tokens, TDD, accessibility)
- "Which skills document these standards?" (workflow-general, workflow-vue, i18n-workflow, etc.)
- "Have I loaded ALL relevant skills into context?"
- If ANY skill is missing → STOP. Load it before switching.

✅ **Good delegation**:
```markdown
# Review spec acceptance criteria first
read_file: memory/planning/active/notification-display-spec.md

# Load ALL relevant skills
read_file: .roo/skills/workflow-general/SKILL.md
read_file: .roo/skills/workflow-functional-changes/SKILL.md
read_file: .roo/skills/workflow-vue/SKILL.md
read_file: .roo/skills/i18n-workflow/SKILL.md
read_file: .roo/skills/icon-system/SKILL.md

# Then delegate with explicit reference
I've loaded workflow-general, workflow-functional-changes, workflow-vue, i18n-workflow, and icon-system into context.
Switch to code mode and follow these skills to implement the notification display feature per spec.
```

❌ **Poor delegation** (NEVER DO THIS):
```markdown
Switch to code mode to implement this.
```

**Alternative**: Start a `new_task` directly in the target mode rather than switching, which triggers fresh skill discovery.

### Why This Matters

**Real failure example**: Orchestrator delegated to Code mode without loading skills → Code mode:
- Used raw Tailwind colors instead of semantic tokens (violated workflow-vue)
- Hardcoded strings instead of i18n (violated i18n-workflow)
- Skipped TDD (violated workflow-functional-changes)
- Missing accessibility standards (violated workflow-vue "Grade A" requirement)

**Root cause**: Skills were NOT in context, so Code mode had no awareness of project standards.

## Subtask Completion Protocol

**MANDATORY AFTER EVERY SUBTASK:**

1. **Update todo list** - Mark current task complete, next task pending
2. **Present results** - Use `attempt_completion` to show what was delivered
3. **STOP and WAIT** - Do NOT automatically start the next subtask
4. **Wait for explicit user instruction** to continue

**VIOLATION CHECK**: Before starting any new subtask, ask yourself:
- "Did the user explicitly say 'continue', 'next', or 'proceed'?"
- If NO → STOP. Use `attempt_completion` and wait.
- If YES → Proceed with next subtask.

**This is NON-NEGOTIABLE.** Auto-chaining subtasks violates user workflow expectations and prevents git commits between phases.

### User Signals to Continue

- "continue"
- "next phase"
- "proceed"
- "next"

### User Signals to Pause

- Anything else (questions, feedback, silence)

## Why This Matters

Users need time to:

- Review code changes
- Run tests locally
- Create git commits for each phase
- Verify behavior manually
- Provide feedback before proceeding

## Anti-Pattern: Auto-Chaining

❌ **DO NOT DO THIS**:

```
subtask complete → update todos → start next subtask
```

✅ **DO THIS**:

```
subtask complete → update todos → attempt_completion → wait for user
```

## Small Commitable Blocks

Each subtask should be a complete, independently testable, prod ready, commitable unit of work that the user can ship without the subsequent phases.

### Before Completion Checklist

- [ ] `./do lint`
- [ ] `./do build`
- [ ] `./do test`
