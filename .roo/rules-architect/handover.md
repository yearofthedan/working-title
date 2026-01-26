# Architect Mode Handover Protocol

## When Switching to Implementation Modes

When delegating work to code, debug, or other implementation modes:

### Your Responsibility

Provide a clear specification and context for the implementation:

1. **Describe the task clearly** - What needs to be implemented and why
2. **Reference relevant architectural decisions** - Link to ADRs if applicable
3. **Mention constraints** - Performance, patterns, or design constraints
4. **Specify success criteria** - How to verify the implementation is correct

### Implementation Mode's Responsibility

The receiving mode (e.g., code, debug) is responsible for:
- Identifying and loading relevant skills from [`.roo/skills/`](../skills/)
- Following project-specific workflows and patterns
- Applying appropriate testing and verification steps

See [code mode skill loading](../rules-code/skill-loading.md) for how implementation modes handle this.

## Example Handover

✅ **Good handover**:
```
Implement a new StepCard component following ADR-001 (Feature Isolation).

Requirements:
- Display step title, status, and content preview
- Support click to expand/collapse
- Follow existing component patterns in src/features/writing-project/

Success criteria:
- Component has Storybook stories
- Unit tests cover key interactions
- Stays under 60-line component limit
```

❌ **Poor handover**:
```
Create a card component.
```

## Why This Approach

- **Separation of concerns**: Architect focuses on design, implementation modes handle execution patterns
- **Autonomous modes**: Each mode knows what it needs to succeed
- **Reduces coordination overhead**: No need to track which skills each mode needs
- **More robust**: Doesn't rely on architect predicting implementation details

- [ ] Identify which skills apply to the task
- [ ] Use `read_file` to load each relevant SKILL.md
- [ ] Verify skills are now in context
- [ ] Include skill names in the handover message
- [ ] Switch to target mode with explicit skill reference
