---
name: conduct-interview
description: Conduct structured interviews to gather requirements through targeted questions. Use during requirements gathering phase to clarify ambiguities and make design decisions explicit before specification writing.
---

# Conduct Interview

Structured interview workflow for gathering requirements through targeted questions. This skill implements the first phase of the interview-then-execute pattern.

## When to Use

- Starting a new feature without complete requirements
- User request is vague or ambiguous
- Multiple design decisions need clarification
- Need to understand architecture preferences before coding
- Building specifications for handoff to implementation modes

## Prerequisites

- User is available to answer questions interactively
- Basic understanding of the domain/technology involved
- Access to planning directory: `memory/planning/active/`

## Interview Workflow

### 1. Parse Initial Request

**Identify:**

- Core feature or change requested
- What context is explicit vs needs clarification
- Areas of potential ambiguity (architecture, UX, data flow)

### 2. Plan Question Sequence

**Progression order:**

1. High-level architecture decisions (OAuth vs JWT, REST vs GraphQL)
2. Feature scope (which providers, what permissions)
3. Edge cases and error handling

**Avoid the Weeds:** Do NOT ask about styling, aesthetics, or specific implementation details (variable names, exact padding, library internals) that a competent implementation mode can determine from the existing codebase and theme.

**Target:** 3-5 key questions for most features (focus on architectural alignment and scope).

### 3. Ask Questions Iteratively

**Each question should:**

- Address ONE specific decision or ambiguity
- Present 2-4 clear, actionable options
- Include context about tradeoffs when relevant
- Build on previous answers logically

**Use the `ask_followup_question` tool with:**

- Clear question addressing single decision
- 2-4 specific, actionable suggestions
- Mode switch if needed for implementation

**See:** [Question Design Patterns](../question-patterns/SKILL.md) for detailed best practices.

### 4. Acknowledge and Build

**After each answer:**

- Confirm understanding naturally: "That makes sense given..."
- Update mental model of the feature
- Identify new questions from the answer
- Show you're listening: "Since you chose JWT, we'll need to decide on token expiry..."

### 5. Recognize Completion

**Interview is complete when:**

- All architectural decisions are explicit
- Feature scope is clearly defined
- Edge cases and error handling addressed
- No significant implementation ambiguities remain

**Signal transition:**
"That's the last major decision. Just a couple quick technical details and we'll write up the spec."

### 6. Act as an Experienced Advisor

Lead with recommendations rather than open-ended questions. Your role is to suggest best-practice patterns and let the user validate or steer.

**When to Recommend vs. Ask:**
- **Recommend**: Standard industry patterns, consistency with existing codebase, or proven UX solutions.
- **Ask**: High-level tradeoffs where multiple valid paths exist, or unique business logic.
- **Delegate**: Implementation details (styles, icons, variable names) should be left to the implementation mode (Code mode).

**Pattern:** "For [feature], I recommend [choice] because [rationale]. Does that align with your vision?"

## Communication Guidelines

### Professional & Direct
Avoid "fluff," empty praise, or "simpering" encouragement. Be a peer advisor, not a cheerleader.
- ✅ "Understood. Moving to authentication..."
- ❌ "Great choice! That's perfect. Now let's look at..."

### Be Honest About Problems
Critique problematic choices directly but professionally:
- ✅ "Storing passwords in plain text is a security risk. I strongly recommend using bcrypt or a similar hashing algorithm."
- ❌ "Excellent! That's the simplest way to do it."

### Handle Uncertainty

When user says "I'm not sure":

1. Acknowledge uncertainty is normal
2. Provide context about common choices
3. Ask about their constraints or priorities
4. Recommend based on their situation

See [Communication Tips](references/communication-tips.md) for detailed guidance.

## Scope Management

### Recognize Oversized Features

**Warning signs:**

- More than 8-10 major questions needed
- Multiple distinct subsystems
- Feature touches many codebase areas
- Would generate 10+ page specification
- Implementation would take weeks

### Suggest Splitting

**Pattern:**

```
"This is a large feature that covers [areas].

I recommend we break this into phases:
- Phase 1: [core functionality]
- Phase 2: [additional features]
- Phase 3: [nice-to-haves]

Should we spec out Phase 1 first, get that implemented, then come back for Phase 2?"
```

### Find Minimum Viable Feature

**Ask:**

- "What's the minimum version that would be useful?"
- "What can we defer to v2 without blocking core value?"
- "If we had to ship in a week, what would we cut?"

## Validation Checklist

Before proceeding to specification phase:

- [ ] All architectural decisions made explicitly
- [ ] Feature scope is clearly bounded
- [ ] Edge cases identified and approach determined
- [ ] No major ambiguities remain
- [ ] User confirms understanding matches intent
- [ ] Scope is manageable (not oversized)
- [ ] Question count was reasonable (5-8 typical)

## Common Pitfalls

**Question Fatigue**

- **Issue:** Asking too many questions overwhelms users
- **Solution:** Skip obvious choices, use sensible defaults, aim for 5-8 questions

**Analysis Paralysis**

- **Issue:** Too many options or overly complex tradeoffs
- **Solution:** Limit to 2-4 options per question, break into multiple questions if needed

**Technical Interrogation**

- **Issue:** Feels like checklist instead of conversation
- **Solution:** Acknowledge answers naturally, explain why asking each question

**Assumed Knowledge**

- **Issue:** Using jargon user may not understand
- **Solution:** Include brief explanations in parentheses

## Next Steps

After completing interview:

1. Proceed to specification phase using [Write Specification](../write-specification/SKILL.md) skill
2. Create spec document in `memory/planning/active/[feature-name]-spec.md`
3. Present spec to user for confirmation
4. Hand off to appropriate implementation mode

## References

- [Question Patterns](../question-patterns/SKILL.md) - Detailed question design best practices
- [Write Specification](../write-specification/SKILL.md) - Next phase in workflow
- [Communication Tips](references/communication-tips.md) - Tone, style, and pacing guidance
