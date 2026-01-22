# Agent Skills Standard Reference

> **Last Updated**: 2026-01-22  
> **Sources**: [agentskills.io](https://agentskills.io) | [Claude Docs](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)  
> **Refresh**: Update if > 30 days old or if specification changes

This document captures the current standard for Agent Skills format and best practices for authoring effective skills.

## Quick Reference

### File Structure (REQUIRED)
```
.roo/skills/
├── skill-name/
│   ├── SKILL.md          # Required: Main skill file
│   ├── scripts/          # Optional: Executable code
│   ├── references/       # Optional: Supporting docs
│   └── assets/           # Optional: Images, data files
```

### SKILL.md Format (REQUIRED)
```markdown
---
name: skill-name
description: Clear description of what the skill does and when to use it (1-1024 chars)
---

# Skill Title

## Recommended Sections
- When to Use
- Prerequisites  
- Step-by-step Instructions
- Validation/Success Criteria
- Common Pitfalls
- References
```

---

## Format Specification

### 1. Directory Structure

Each skill MUST be a directory containing a `SKILL.md` file:

```
skill-name/
└── SKILL.md              # Required
```

Optional subdirectories:
- `scripts/` - Executable code agents can run
- `references/` - Supporting documentation  
- `assets/` - Images, data files

### 2. YAML Frontmatter (Required Fields)

Every `SKILL.md` must start with YAML frontmatter:

```yaml
---
name: skill-name
description: What this skill does and when to use it
---
```

#### Field Requirements

| Field | Required | Constraints |
|-------|----------|-------------|
| `name` | ✅ Yes | Max 64 chars, lowercase letters/numbers/hyphens only, must match directory name, no XML tags |
| `description` | ✅ Yes | Max 1024 chars, non-empty, no XML tags, should include WHAT and WHEN |

#### Optional Fields

| Field | Purpose | Notes |
|-------|---------|-------|
| `license` | License name or reference | E.g., "MIT" or "See LICENSE.txt" |
| `compatibility` | Environment requirements | E.g., "Requires git, docker, jq" |
| `metadata` | Additional key-value pairs | Arbitrary properties |
| `allowed-tools` | Pre-approved tools list | Experimental, may vary by agent |

### 3. Markdown Body Content

After frontmatter, provide clear instructions. **Keep under 500 lines** for optimal performance.

#### Recommended Sections

1. **Title** (optional H1 - name is already in frontmatter)
2. **When to Use** - Specific scenarios and triggers
3. **Prerequisites** - Required tools, knowledge, or setup
4. **Steps** - Clear, numbered workflow
5. **Validation Checklist** - Success criteria
6. **Common Pitfalls** - Known issues and gotchas
7. **References** - Links to related skills, rules, patterns

---

## Best Practices

### Core Principles

#### 1. Concise is Key

**Context Budget**: Your skill shares the context window with:
- The system prompt
- User's instructions
- Tool definitions
- Conversation history

**Guidelines**:
- SKILL.md body should be under 500 lines
- Use progressive disclosure (link to details rather than including everything)
- One level deep for file references (avoid chaining)

#### 2. Specific Descriptions

**Bad**: "Process PDF files"

**Good**: "Extract text and tables from PDF files, fill PDF forms, and merge multiple PDFs into consolidated documents. Use when working with document processing pipelines."

**Why**: Specific descriptions help Claude:
- Discover the skill for relevant tasks
- Understand when NOT to use it
- Include keywords agents search for

#### 3. Show Don't Tell

**Bad**: "Configure the database connection appropriately"

**Good**: 
```python
# In config/database.yml
production:
  adapter: postgresql
  database: myapp_prod
  host: db.example.com
  port: 5432
```

#### 4. Progressive Disclosure

Split content strategically:

**Main SKILL.md**: High-level workflow, when to use, quick examples
**Separate Files**: Detailed schemas, extensive tables, old patterns, advanced scenarios

**Example**:
```markdown
For detailed field validation rules, see [references/validation-rules.md](references/validation-rules.md)
```

#### 5. Handle Time Sensitivity

**Avoid**: "As of 2024, the latest version is..."

**Instead**:
- Put version-specific info in a "Historical Patterns" or "Deprecated" section
- Use generalized instructions that work across versions
- Link to official docs for current versions

#### 6. Consistent Terminology

Pick terms and stick with them throughout:
- ❌ "record" in one place, "entry" in another
- ✅ Always use "record" OR always use "entry"

### Scripts and Executable Code

#### When to Include Scripts

**Good Use Cases**:
- Deterministic operations (parsing, validation)
- Complex algorithms Claude shouldn't reinvent
- Operations requiring specific libraries
- Tasks needing exact output format

**Bad Use Cases**:
- Simple tasks Claude can do directly
- Operations that need customization each time
- "Write this code for me" templates

#### Script Best Practices

1. **Be Explicit About Installation**:
   ```markdown
   Install required package: `pip install pypdf`
   
   Then use it:
   ```python
   from pypdf import PdfReader
   reader = PdfReader("file.pdf")
   ```
   ```

2. **Make Intent Clear**:
   - "Run `analyze_form.py` to extract fields" (execute)
   - "See `analyze_form.py` for the extraction algorithm" (reference)

3. **Error Handling**:
   - Include helpful error messages
   - Handle edge cases explicitly
   - Provide validation steps

4. **No Magic Numbers**:
   ```python
   # Bad
   threshold = 0.85
   
   # Good
   # Match threshold: Higher = stricter matching
   # 0.85 balances false positives vs false negatives based on testing
   threshold = 0.85
   ```

### Content Organization

#### Step-by-Step Workflows

**Format**:
```markdown
## Steps

1. **Action**: Brief explanation
2. **Next Action**: What to do and why
3. **Validation**: How to verify it worked
```

**Tips**:
- Use bold for the action verb
- Keep each step atomic
- Include verification after critical steps

#### Checklists

Use for validation, prerequisites, or quality gates:

```markdown
## Validation Checklist

- [ ] New test case passes
- [ ] All existing tests pass
- [ ] No regressions in Storybook
- [ ] Linting passes
```

#### Examples

**Always Include**:
- Concrete examples (not abstract)
- Both good and bad examples when helpful
- Real file paths, not placeholders

**Bad**: "Configure your settings appropriately"

**Good**: "Set `timeout: 30` in `config/app.yml` for API calls"

### Testing Your Skills

1. **Create Evaluations**: At least 3 test scenarios
2. **Test Across Models**: Try with Haiku, Sonnet, and Opus
3. **Real Usage**: Test with actual use cases, not hypotheticals
4. **Iterate**: Use Claude A to refine, Claude B to test
5. **Team Feedback**: If applicable, get input from teammates

#### Iterative Refinement Pattern

1. **Create with Claude A**: Draft the skill interactively
2. **Observe with Claude B**: Use skill with fresh instance, observe behavior
3. **Refine with Claude A**: "When testing, Claude missed X. Should we add Y?"
4. **Repeat**: Continue based on real usage

---

## Checklist for Effective Skills

### Core Quality
- [ ] Description is specific and includes key terms
- [ ] Description includes both WHAT and WHEN to use
- [ ] SKILL.md body is under 500 lines
- [ ] Additional details are in separate files (if needed)
- [ ] No time-sensitive information (or in "old patterns" section)
- [ ] Consistent terminology throughout
- [ ] Examples are concrete, not abstract
- [ ] File references are one level deep
- [ ] Progressive disclosure used appropriately
- [ ] Workflows have clear steps

### Code and Scripts
- [ ] Scripts solve problems rather than punt to Claude
- [ ] Error handling is explicit and helpful
- [ ] No "voodoo constants" (all values justified)
- [ ] Required packages listed and verified as available
- [ ] Scripts have clear documentation
- [ ] No Windows-style paths (all forward slashes)
- [ ] Validation/verification steps for critical operations
- [ ] Feedback loops for quality-critical tasks

### Testing
- [ ] At least 3 evaluations created
- [ ] Tested with Haiku, Sonnet, and Opus
- [ ] Tested with real usage scenarios
- [ ] Team feedback incorporated (if applicable)

---

## Migration from Old Format

If you have skills in the old format (single `.md` files), here's how to convert:

### Old Format
```
.roo/skills/
├── update-component-tdd.md
├── add-feature-module.md
└── debug-test-failure.md
```

### New Format
```
.roo/skills/
├── update-component-tdd/
│   └── SKILL.md
├── add-feature-module/
│   └── SKILL.md
└── debug-test-failure/
    └── SKILL.md
```

### Conversion Steps

1. **Create directory** matching skill name (from filename)
2. **Add YAML frontmatter**:
   - Extract name from filename (kebab-case)
   - Write concise description from first paragraph
3. **Remove "Skill:" prefix** from title (if present)
4. **Move content** to `SKILL.md` in new directory
5. **Update cross-references** to point to new paths
6. **Delete old file** after verification

---

## Examples

### Minimal Skill

```markdown
---
name: code-review
description: Systematic code review checklist covering security, performance, readability, and testing. Use before merging pull requests.
---

# Code Review

## When to Use

- Before merging any pull request
- During pair programming sessions
- When reviewing significant refactors

## Steps

1. **Security**: Check for vulnerabilities, injection risks, exposed secrets
2. **Performance**: Look for N+1 queries, unnecessary loops, memory leaks
3. **Readability**: Verify naming, comments, structure
4. **Testing**: Ensure adequate test coverage
5. **Documentation**: Update relevant docs

## Validation Checklist

- [ ] No security vulnerabilities found
- [ ] Performance acceptable for scale
- [ ] Code is self-documenting
- [ ] Tests cover happy path and edge cases
- [ ] Documentation updated
```

### Skill with Scripts

```
pdf-processing/
├── SKILL.md
├── scripts/
│   ├── extract_text.py
│   ├── merge_pdfs.py
│   └── fill_form.py
└── references/
    └── field-mappings.md
```

---

## Related Resources

- [Skills Overview](https://agentskills.io) - Complete specification
- [Claude Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) - Authoring guide
- [Integrate Skills](https://agentskills.io/integrate-skills) - How agents use skills
