# Skills System

This directory contains executable **skills** for Roo agents. Each skill provides step-by-step workflows and best practices for specific development tasks, ensuring consistent application of project standards like Feature Isolation (ADR-001) and Testing Patterns.

## Skill Format

Each skill is organized as a directory containing:
- `SKILL.md`: Main workflow with YAML frontmatter (name and description).
- `references/`: Supporting documentation and detailed patterns (optional).
- `scripts/`: Executable code or automation scripts (optional).

## Core Development Skills

- [plan-functional-slices/](plan-functional-slices/): **MANDATORY** - Enforces vertical slicing over horizontal layering. Used for planning and implementation.
- [workflow-general/](workflow-general/): **ALWAYS LOAD FIRST** - General project interactions, `./do` scripts, linting, commits
- [workflow-vue/](workflow-vue/): Standards for component and composable creation, styling, and ensuring components stay under the 60-line limit
- [tdd-enforcement/](tdd-enforcement/): Strict RED-GREEN-REFACTOR enforcement for features with user feedback (notifications, forms, navigation)
- [storybook-workflow/](storybook-workflow/): Create and maintain Storybook stories with variants and smoke testing
- [workflow-third-party-libraries/](workflow-third-party-libraries/): Guidelines for adding and isolating external dependencies

**Note**: For i18n and icon patterns, see [docs/guides/](../../docs/guides/) instead of skills.

## Architecture

For architectural decisions and rationale, see [docs/decisions/index.md](../../docs/decisions/index.md).

## Tooling

- [ensure-browser-automation/](ensure-browser-automation/): Verifying and starting Chromium for Vitest Browser Mode or research tasks.
