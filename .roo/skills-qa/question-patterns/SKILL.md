---
name: question-patterns
description: Question design patterns and best practices for requirements gathering interviews. Use when crafting effective questions that gather information without overwhelming users or requiring unnecessary detail.
---

# Question Patterns

Best practices for crafting effective questions during requirements gathering interviews. This skill helps you design questions that are clear, actionable, and efficient.

## When to Use

- Designing questions during interview phase
- Unsure how to phrase a question effectively
- Need to present options that are clear and actionable
- Want to avoid common question anti-patterns
- Checking question quality before asking

## Question Design Principles

### 1. One Decision Per Question

Each question should address a single decision point.

✅ **Good:** "What authentication method should we use?"
- OAuth 2.0 with external providers
- JWT tokens with username/password  
- Session-based authentication
- Magic link via email

❌ **Bad:** "How should authentication, authorization, and session management work?"
(This bundles multiple decisions together)

### 2. Actionable Options

Present options that are clear, complete, and ready to implement.

✅ **Good:**
- "Wait and retry: Poll /status every 2s until idle, max 30s timeout"
- "Fail immediately: Return 503 error if busy, include retry-after header"
- "Queue for later: Add to background job queue, return 202 accepted"

❌ **Bad:**
- "Handle it somehow"
- "Do the right thing"
- "Figure it out based on the situation"

### 3. Include Context

Help users understand tradeoffs when relevant.

**Example:**
"How should we handle image storage?"
- "Local filesystem (simple, but requires disk space and backup strategy)"
- "S3-compatible storage (scalable, costs ~$0.023/GB/month)"
- "Database BLOBs (easy backup, but can bloat database size)"

### 4. Progressive Disclosure

Start broad, then narrow based on answers.

**Sequence Example:**
1. "What type of feature?" → data visualization
2. "What library?" → D3.js
3. "What chart types?" → sankey
4. "Should links be interactive?" → click

### 5. Sensible Defaults

When there's a clear best practice, include it as the first option.

**Example:**
"How should API errors be formatted?"
- "RFC 7807 Problem Details (recommended standard for REST APIs)"
- "Custom JSON format with {error, message, code} structure"
- "Plain text error messages"

## What to Ask About

### Architecture Decisions
- Authentication approach (OAuth, JWT, sessions)
- Data storage (SQL, NoSQL, files, hybrid)
- API style (REST, GraphQL, gRPC)
- State management (Vuex, Pinia, composables)
- Deployment target (serverless, containers, static)

### Feature Scope
- Which third-party providers to support
- What user roles and permissions needed
- Whether to include admin interface
- What data fields are required vs optional
- Whether to support bulk operations

### Edge Cases
- What happens when session expires
- How to handle rate limiting
- What to do with orphaned data
- How to handle concurrent updates
- What happens if external API is down

### UX Decisions
- Should actions require confirmation
- How to display loading states
- What error messages to show users
- Whether to auto-save or require explicit save
- How to handle navigation with unsaved changes

### Technical Details
- Port numbers and endpoints
- Environment variable names
- File paths and naming conventions
- Database table names
- Cache TTL values

## What NOT to Ask About

### Obvious Choices
Don't ask about widely accepted best practices.

❌ "Should we use semantic HTML?" (yes, always)
❌ "Should we validate user input?" (yes, always)

### Implementation Micro-Details
Don't ask about things that can be decided during implementation.

❌ "Should this function be called getUserData or fetchUserData?"
❌ "What should the variable names be?"

### Already Established
Don't ask about conventions already in the codebase.

❌ If project uses Pinia, don't ask "Should we use Vuex or Pinia?"
❌ If project uses Tailwind, don't ask "What CSS framework?"

### False Choices
Don't present options when there's really only one viable choice.

❌ "Should we validate user input?" (yes, always - not a choice)

## Anti-Patterns to Avoid

### Question Fatigue
**Issue:** Asking too many questions overwhelms users

**Solution:**
- Group related decisions
- Use sensible defaults
- Skip obvious choices
- Aim for 5-8 key questions per feature

### Analysis Paralysis
**Issue:** Too many options or overly complex tradeoffs

**Solution:**
- Limit to 2-4 options per question
- Break complex decisions into multiple questions
- Simplify tradeoff explanations

### Assumed Knowledge
**Issue:** Using jargon user may not understand

**Solution:**
Include brief explanations in parentheses:
"CORS (Cross-Origin Resource Sharing - allows requests from different domains)"

### Leading Questions
**Issue:** Steering toward a particular answer

**Solution:**
- Present all viable options fairly
- Let user's needs drive decision, not your preference
- Be neutral in question phrasing

## Quality Checklist

### Before Asking Each Question
- [ ] Is this necessary, or can I use a sensible default?
- [ ] Does this address ONE clear decision?
- [ ] Are all options actionable and complete?
- [ ] Have I included relevant context about tradeoffs?
- [ ] Is the question clear without jargon?
- [ ] Are there 2-4 options (not too few, not too many)?

### During Interview
- [ ] Am I building on previous answers logically?
- [ ] Have I avoided question fatigue (not too many)?
- [ ] Am I capturing answers in mental model?

### Before Writing Spec
- [ ] Do I have answers to all critical decisions?
- [ ] Are any answers contradictory or unclear?
- [ ] Should I ask follow-ups to clarify?

## Complete Example

See [Authentication Feature Example](examples/auth-feature.md) for a full end-to-end interview demonstrating:
- Progressive narrowing from auth method to security details
- Building on previous answers naturally
- Context in options explaining tradeoffs
- Sensible defaults presented first
- Reasonable scope (6 questions covering major decisions)

## Key Patterns

### Progressive Narrowing
Start broad, narrow based on answers.
Example: Format → Size handling → Filters → Retention

### Clarify Vague Requests
When request is unclear, first understand intent.
Example: "Make it faster" → What aspect? → Measured or suspected? → Profile or optimize?

### Expose Tradeoffs
Help users understand implications of choices.
Example: Sync vs async exports: UX vs complexity vs dataset size

### Confirm Understanding
After key answers, summarize understanding.
Example: "So we're building JWT auth with self-registration and email verification. Is that correct?"

## References

- [Conduct Interview](../conduct-interview/SKILL.md) - Full interview workflow
- [Write Specification](../write-specification/SKILL.md) - Next phase after interview
- [Auth Feature Example](examples/auth-feature.md) - Complete end-to-end example
