# Orchestrator Workflow Control

## Mode Switching and Skills

**Critical**: When switching modes in the same conversation thread, the new mode inherits existing context and does NOT re-scan for skills.

### Skill Handover Pattern

When delegating to another mode that should use skills:

1. **Identify relevant skills** from [`.roo/skills/`](../skills/)
2. **Load skills into context** using `read_file` on each SKILL.md
3. **Switch with explicit reference** mentioning which skills to follow

✅ **Good delegation**:
```markdown
# Load skills first
read_file: .roo/skills/workflow-general/SKILL.md
read_file: .roo/skills/workflow-vue-components/SKILL.md

# Then delegate with explicit reference
I've loaded workflow-general and workflow-vue-components into context.
Switch to code mode and follow these skills to implement the feature.
```

❌ **Poor delegation**:
```markdown
Switch to code mode to implement this.
```

**Alternative**: Start a new task directly in the target mode rather than switching, which triggers fresh skill discovery.

## Subtask Completion Protocol

After EVERY subtask completion:

1. **Update todo list** - Mark current task complete, next task pending
2. **Present results** - Use `attempt_completion` to show what was delivered
3. **STOP and WAIT** - Do NOT automatically start the next subtask
4. **Wait for explicit user instruction** to continue

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
