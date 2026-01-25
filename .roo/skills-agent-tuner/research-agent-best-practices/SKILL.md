---
name: research-agent-best-practices
description: Fetch and synthesize current agent methodology from agentskills.io and official documentation. Use when advising on .roo/ structure, skills format, or agent best practices. Checks local cache first, refreshes if stale (>30 days).
---

# Research Agent Best Practices

Fetch and synthesize the latest agent methodology and best practices from official documentation and industry standards to ensure agent advice is current and accurate.

## When to Use

- When advising on `.roo/` directory organization
- Before recommending changes to skills, rules, or memory structure
- When questions arise about agent skills format or methodology
- Before creating new skills or modes
- When validating compliance with current standards

## Prerequisites

- Access to [`browser_action`](https://docs.roocode.com/advanced-usage/available-tools/browser-action) tool for web research
- Ability to read and update local reference files

## Procedure

### 1. Check Local Reference First

**Always start here to avoid unnecessary web requests:**

- Read [`agent-skills-standard.md`](/references/agent-skills-standard.md)
- Check the "Last Updated" date in the document
- If updated within last 30 days, use this as authoritative source and skip to step 5
- If > 30 days old, proceed to step 2 to refresh

### 2. Visit Primary Methodology Source

**Only if local reference is stale (>30 days):**

- Use `browser_action` to navigate to [agentskills.io](https://agentskills.io)
- Review current recommendations for:
  - Skill documentation structure (directory format, SKILL.md, frontmatter)
  - Context organization patterns (rules vs. memory vs. skills)
  - Directory structure best practices
  - YAML frontmatter requirements

### 3. Check Official Agent Documentation

**Continue if local reference was stale:**

- Navigate to [Claude's Agent Skills Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
- Review for:
  - Core principles (concise is key, progressive disclosure)
  - Script best practices
  - Content organization patterns
  - Testing and iteration guidance
- Optionally check [Roo Code documentation](https://docs.roocode.com) for mode-specific updates

### 4. Update Local Reference

**If you fetched fresh data:**

- Update [`agent-skills-standard.md`](references/agent-skills-standard.md) with new findings
- Update the "Last Updated" date at the top
- Note any significant changes from previous version
- Preserve the structure: Quick Reference → Specification → Best Practices → Migration Guide

### 5. Synthesize Findings

**Compare current setup with best practices:**

- Identify key deviations between the project's current setup and latest standards
- Note specific examples of improved patterns (e.g., directory structure, frontmatter format)
- Summarize the most critical updates that will impact agent effectiveness
- Prioritize recommendations by impact

### 6. Verify Application

**Prepare actionable recommendations:**

- Compare synthesized findings with project's [`.roo/`](../../) directory structure
- Check [`.roomodes`](../../.roomodes) file for mode configuration alignment
- Review existing skills against current format requirements
- Prepare specific, actionable recommendations backed by these findings

## Validation Checklist

- [ ] Local reference checked and date noted
- [ ] If stale, fresh data fetched from agentskills.io and Claude docs
- [ ] Local reference updated with current date (if fetched fresh)
- [ ] Key deviations identified between project and best practices
- [ ] Recommendations are specific and actionable
- [ ] Recommendations backed by current standards, not outdated knowledge

## Common Pitfalls

**Outdated Knowledge**
- **Issue**: Relying on cached knowledge instead of current docs
- **Solution**: Always check local reference date first, refresh if needed

**Vague Recommendations**
- **Issue**: "You should improve your skills format"
- **Solution**: Provide specific examples: "Move skills to directories with SKILL.md and add YAML frontmatter with name and description fields"

**Overwhelming Changes**
- **Issue**: Recommending 20 changes at once
- **Solution**: Prioritize by impact, present 3-5 highest-value changes first

## Notes

- This skill uses a two-tier caching strategy: check local reference (fast) before web research (slow)
- Local reference should be updated whenever fresh research is performed
- 30-day cache is a balance between freshness and efficiency
- Standards change infrequently, so this cache works well

## References

- [Agent Skills Standard (Local Cache)](references/agent-skills-standard.md)
- [Agent Tuner Mode Configuration](../../.roomodes)
- [agentskills.io](https://agentskills.io) - Official specification
- [Claude Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)
