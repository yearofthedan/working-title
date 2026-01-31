---
name: write-specification
description: Build comprehensive specification documents that eliminate ambiguity for implementation teams. Use after interview phase to document all decisions and requirements in a clear, actionable format.
---

# Write Specification

Create comprehensive specification documents that translate interview findings into clear, actionable requirements for implementation modes.

## When to Use

- After completing interview phase with all major decisions made
- When transitioning from requirements gathering to implementation planning
- Before handing off work to Code, Architect, or Debug modes
- When documenting complex features that need clear reference

## Prerequisites

- Interview phase completed (all architectural decisions made)
- Feature scope clearly defined
- Edge cases and error handling approaches determined
- Access to `memory/planning/active/` directory

## Specification Writing Process

### 1. Choose File Location

**Pattern:** `memory/planning/active/[feature-name]-spec.md`

**Examples:**
- `authentication-spec.md`
- `data-export-spec.md`
- `file-storage-spec.md`

### 2. Structure the Document

Use this core structure (see [Full Template](references/full-template.md) for details):

```markdown
# Feature Specification: [Feature Name]

**Status:** Draft | Review | Approved
**Target Mode:** Code | Architect | Debug
**Created:** [Date]

## Overview
- What (one sentence)
- Why (problem solved)
- Who (primary users)
- Success Criteria (measurable outcomes)

## Architectural Decisions
[Each major decision with rationale, alternatives considered, tradeoffs]

## Functional Requirements
[What the system must do - user actions and system behaviors]

## Edge Cases and Error Handling
[How system handles exceptional situations]

## Data Models (if applicable)
[Key data structures - high level only]

## API Endpoints (if applicable)
[External interface definition]

## UI Flows (if applicable)
[User interface behavior]

## Out of Scope
[What is explicitly NOT included]

## Acceptance Criteria
[Testable checklist of completion criteria]

## Implementation Notes
[Helpful context without over-constraining]
```

### 3. Document Decisions with Context

**Bad:** "Use JWT"

**Good:** "Use JWT-based authentication for stateless, horizontally scalable auth that works with mobile apps and microservices."

**Include:**
- What was chosen
- Why it was chosen over alternatives
- What tradeoffs were accepted

### 4. Be Specific, Not Prescriptive

**Define WHAT, let implementation decide HOW:**

✅ "Email verification required before login"
❌ "Create a verifyEmail() function in the auth service"

✅ "On 409 Conflict: Show 'Email already exists' with link to password reset"
❌ "Handle duplicate email error appropriately"

### 5. Make Tradeoffs Explicit

Help implementers make aligned decisions:

**Example:**
"Chose eventual consistency to improve performance. Data may be stale for up to 30s. This is acceptable because [reason]."

### 6. Include Concrete Examples

**Bad:** "Validate password strength"

**Good:** "Password validation: minimum 8 characters, at least 1 uppercase, 1 number. Example: 'SecurePass123'"

## Presenting the Specification

### Introduction Pattern

"I have everything I need. Let me write up a comprehensive specification that captures all the decisions we've made.

This will include:
- All the architectural decisions with rationale
- Detailed requirements for each feature
- How to handle edge cases and errors
- Clear acceptance criteria

Give me a moment to put this together..."

### Presentation Pattern

"I've created a complete specification: [file path]

Here's a summary of what we're building:

[2-3 sentence overview]

Key decisions:
- [Decision 1]: [Choice] because [reason]
- [Decision 2]: [Choice] because [reason]
- [Decision 3]: [Choice] because [reason]

The spec includes detailed requirements, edge case handling, and acceptance criteria.

Does this match what you had in mind? Anything you'd like to adjust?"

### Handling Feedback

**Positive:**
"Excellent! The spec is ready for implementation."

**Minor adjustments:**
"No problem - let's refine that section. What would you like to change about [topic]?"

**Major changes:**
"I see - that's a significant change that affects several decisions we made. Let's revisit those questions to make sure everything aligns..."

## Quality Checklist

### Completeness
- [ ] All architectural decisions documented with rationale
- [ ] All functional requirements are specific and testable
- [ ] Edge cases and error scenarios addressed
- [ ] Out of scope items explicitly listed
- [ ] Acceptance criteria are clear and measurable

### Clarity
- [ ] Someone unfamiliar with interview can understand spec
- [ ] No unexplained jargon or acronyms
- [ ] Examples provided where helpful
- [ ] Tradeoffs and constraints explicit

### Implementation Readiness
- [ ] Spec provides enough detail to start coding
- [ ] No major ambiguities remain
- [ ] Success criteria are testable
- [ ] Spec doesn't over-constrain implementation choices

## Common Pitfalls

**Over-Prescriptive**
- **Issue:** Specifying HOW instead of WHAT
- **Solution:** Focus on outcomes, not implementation details

**Vague Requirements**
- **Issue:** "Handle errors appropriately"
- **Solution:** "On 409 Conflict: Show 'Email exists' with password reset link"

**Missing Context**
- **Issue:** Decision without rationale
- **Solution:** Always explain WHY each decision was made

**Hidden Assumptions**
- **Issue:** Assuming knowledge not in spec
- **Solution:** Make everything explicit, especially edge cases

## Handoff Process

### 1. Recommend Appropriate Mode

**Code mode:** Straightforward implementation with clear requirements
**Architect mode:** Design needs further breakdown or exploration
**Debug mode:** Need to investigate existing behavior first
**Orchestrator mode:** Large feature requiring coordination

### 2. Provide Handoff Instructions

**Pattern:**
"Start a new session in [Mode] with this prompt:
'Implement the feature specified in memory/planning/active/[feature-name]-spec.md'"

### 3. Confirm Readiness

Ensure spec is approved before handoff:
- User confirmed spec matches intent
- All questions resolved
- File saved in correct location

## References

- [Full Template](references/full-template.md) - Complete specification template with all sections
- [Conduct Interview](../conduct-interview/SKILL.md) - Previous phase in workflow
- [Question Patterns](../question-patterns/SKILL.md) - Question design best practices
