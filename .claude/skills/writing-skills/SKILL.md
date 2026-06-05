---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
metadata:
  internal: true
---

<!-- Adapted from superpowers by Jesse Vincent (MIT). See LICENSE in this directory. -->

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

## What is a Skill?

A **skill** is a reference guide for proven techniques, patterns, or tools. Skills help future Claude instances find and apply effective approaches.

**Skills are:** Reusable techniques, patterns, tools, reference guides
**Skills are NOT:** Narratives about how you solved a problem once

## TDD Mapping for Skills

| TDD Concept | Skill Creation |
|-------------|----------------|
| **Test case** | Pressure scenario with subagent |
| **Production code** | Skill document (SKILL.md) |
| **Test fails (RED)** | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Agent complies with skill present |
| **Refactor** | Close loopholes while maintaining compliance |
| **Write test first** | Run baseline scenario BEFORE writing skill |

The entire skill creation process follows RED-GREEN-REFACTOR.

## When to Create a Skill

**Create when:**
- Technique wasn't intuitively obvious to you
- You'd reference this again across projects
- Pattern applies broadly

**Don't create for:**
- One-off solutions
- Standard practices well-documented elsewhere
- Project-specific conventions (put in CLAUDE.md)
- Mechanical constraints (if enforceable with regex/validation, automate it — save documentation for judgment calls)

## SKILL.md Structure

**Frontmatter (YAML):**
- Two required fields: `name` and `description`
- Max 1024 characters total
- `name`: letters, numbers, and hyphens only
- `description`: Third-person, describes ONLY when to use (NOT what it does)
  - Start with "Use when..." to focus on triggering conditions
  - Include specific symptoms, situations, and contexts
  - **NEVER summarize the skill's process or workflow** (see CSO section)

```markdown
---
name: skill-name-with-hyphens
description: Use when [specific triggering conditions and symptoms]
---

# Skill Name

## Overview
What is this? Core principle in 1-2 sentences.

## When to Use
Bullet list with SYMPTOMS and use cases. When NOT to use.

## Quick Reference
Table or bullets for scanning common operations.

## Implementation
Inline code for simple patterns; link to a file for heavy reference.

## Common Mistakes
What goes wrong + fixes.
```

## Claude Search Optimization (CSO)

**Critical for discovery:** Future Claude needs to FIND your skill.

### 1. Rich Description Field

Claude reads the description to decide which skills to load. Make it answer "Should I read this skill right now?"

**CRITICAL: Description = When to Use, NOT What the Skill Does.** Testing revealed that when a description summarizes the workflow, Claude may follow the description instead of reading the full skill — e.g. a description saying "code review between tasks" caused ONE review when the skill specified TWO. Describe only triggering conditions.

```yaml
# BAD: Summarizes workflow — Claude may follow this instead of reading the skill
description: Use when executing plans - dispatches subagent per task with code review between tasks

# GOOD: Just triggering conditions
description: Use when executing implementation plans with independent tasks in the current session
```

### 2. Keyword Coverage

Use words Claude would search for: error messages, symptoms (flaky, hanging, leak), synonyms, tool/library names.

### 3. Descriptive Naming

Active voice, verb-first: `creating-skills` not `skill-creation`; `condition-based-waiting` not `async-test-helpers`.

### 4. Token Efficiency

Frequently-loaded skills cost tokens every conversation. Target: getting-started < 150 words, frequently-loaded < 200 words, others < 500. Move flag details to `--help`; cross-reference other skills instead of repeating them.

## The Iron Law (Same as TDD)

```
NO SKILL WITHOUT A FAILING TEST FIRST
```

This applies to NEW skills AND EDITS. Write skill before testing? Delete it. Start over. No exceptions — not for "simple additions", not for "just adding a section".

## RED-GREEN-REFACTOR for Skills

### RED: Write Failing Test (Baseline)
Run a pressure scenario with a subagent WITHOUT the skill. Document exact behavior and the verbatim rationalizations used. You must see what agents naturally do before writing the skill.

### GREEN: Write Minimal Skill
Write the skill addressing those specific rationalizations. Don't add content for hypothetical cases. Re-run the scenarios WITH the skill; the agent should now comply.

### REFACTOR: Close Loopholes
Agent found a new rationalization? Add an explicit counter. Re-test until bulletproof.

## Anti-Patterns

- **Narrative example** ("In session 2025-10-03, we found…") — too specific, not reusable
- **Multi-language dilution** (example-js.js, example-py.py) — mediocre quality, maintenance burden
- **Generic labels** (helper1, step3) — labels should have semantic meaning

## Skill Creation Checklist

**RED:** create pressure scenarios → run without skill, document baseline verbatim → identify rationalization patterns.
**GREEN:** name uses only letters/numbers/hyphens → `name` + `description` frontmatter (≤1024 chars) → description starts "Use when…", third person, no workflow summary → keywords for search → address the baseline failures → one excellent example → re-run with skill, verify compliance.
**REFACTOR:** identify new rationalizations → add counters → red-flags list → re-test until bulletproof.
