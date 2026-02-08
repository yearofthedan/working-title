---
name: plan-functional-slices
description: MANDATORY before breaking down any feature or task. Prevents horizontal layering (infra→composable→component→tests) by enforcing vertical slices (working feature→tests→next feature). Used by planning modes creating specs AND code modes receiving tasks.
---

# Plan: Functional Value Slicing

## Objective

Deliver working software early by focusing on vertical integration. Avoid "horizontal" work (building layers) that results in late integration.

Vertical slicing recognizes that we learn as we build, and prioritizes fast feedback to keep a plan flexible.

## For Planning Modes (Architect, Orchestrator, QA)

When creating task lists or specifications:
- Output format: Numbered vertical slices, each with acceptance criteria
- Each task must include: UI change + logic + test
- Hand off ONE slice at a time to code mode
- Example: "Task 1: User can open side panel (Acceptance: Click trigger → panel appears with close button, verified through component test)"

## For Implementation Modes (Code, Debug)

When receiving a task:
- STOP. Read the full task first.
- Before writing ANY code, verbally describe your vertical slicing approach
- State explicitly: "I will NOT build [composable/component/tests] in isolation"
- Show incremental verification points BEFORE starting

## Core Principle

**Think in user behaviors, not technical layers.**

**Rule of thumb:** If you can't describe it as "User can [verb] [noun]", slice smaller.

**Examples:**
- ✅ "User can open panel" - Complete behavior  
- ❌ "Add a button" - No behavior
- ❌ "Build panel system" - Too coarse

**Exception:** First slice may be "Panel renders in Storybook" (component + test + story, all committed together) to bootstrap.

## Implementation Examples

### BAD Reasoning (Horizontal Layering)

1. "I'll create the composable with all the state and methods."
2. "Then I'll create the component and wire it to the state."
3. "Then I'll write the stories and tests."
4. "Finally, I'll run verification." (High risk: failure found too late)

**Why this fails:**
- LLMs naturally organize by technical similarity (all state together, all UI together)
- Delays integration risk until the end
- Tests written last can't guide implementation
- User doesn't see progress until everything is done
- Refactoring and debugging cost more tokens because the scope of work is large

### GOOD Reasoning (Vertical Slicing)

1. "User can open panel: Add trigger button, minimal panel component (just a div), wire click handler, test that click shows panel"
2. **Verify: Click button → panel div appears in DOM (test + Storybook)**
3. "User can close panel: Add close button to panel, wire handler, test that click hides panel"
4. **Verify: Click close → panel disappears (test + Storybook)**
5. "Panel displays content: Add content prop to panel, wire to parent, test content renders"
6. **Verify: Panel shows actual content from parent (test + Storybook)**

## Procedure

### 1. Before Starting
- STOP. Describe your vertical slicing approach
- State explicitly what you will NOT build in isolation
- Show verification points for each slice

### 2. For Each Slice
- **Map the vertical:** What files/changes deliver this ONE behavior?
- **Implement:** Write test + code + story together
- **Verify:** Run tests, view Storybook, confirm committable
- **Pause:** Show user the working behavior, invite feedback

### 3. Reflection and Feedback

After completing each slice, pause and show the user what was built:
- **Demonstrate the working behavior** (test output, Storybook link, or description)
- **Invite feedback**: "This slice lets users [behavior]. Does this match your expectations?"
- **Be ready to adapt**: User may discover new requirements now that they see it working

**Why this matters:** Working software reveals assumptions. Fast feedback prevents building the wrong thing.

Unless explicitly told to continue without pausing, always stop after each slice for user validation.

## Antipatterns

**Red flags you're doing horizontal slicing:**
- Creating files without tests
- "I'll wire them up later"
- Building multiple files before running anything
- Building infrastructure "just in case"

**Wrong granularity:**
- Too granular: "Add button" with no behavior
- Too coarse: "Build entire panel system"  
- Sweet spot: Smallest complete user behavior

**Process failures:**
- Not seeking feedback after each slice
- Unwilling to adapt based on new information
- Adding more than needed to complete the slice
