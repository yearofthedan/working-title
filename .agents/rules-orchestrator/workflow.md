# Orchestrator Workflow Control

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
- [ ] `./do test`
- [ ] `./do build`
