# Skills System

This directory contains executable **skills** for Roo agents. Each skill provides step-by-step workflows and best practices for specific development tasks, ensuring consistent application of project standards like Feature Isolation (ADR-001) and Testing Patterns.

## Skill Format

Each skill is organized as a directory containing:
- `SKILL.md`: Main workflow with YAML frontmatter (name and description).
- `references/`: Supporting documentation and detailed patterns (optional).
- `scripts/`: Executable code or automation scripts (optional).

## Core Development Skills

- [workflow-general/](workflow-general/): **ALWAYS LOAD FIRST** - General project interactions, `./do` scripts, linting, commits
- [workflow-functional-changes/](workflow-functional-changes/): Guidance for working on vertical slices, TDD cycles, and verification
- [workflow-vue/](workflow-vue/): Standards for component and composable creation, styling, and ensuring components stay under the 60-line limit
- [tdd-enforcement/](tdd-enforcement/): Strict RED-GREEN-REFACTOR enforcement for features with user feedback (notifications, forms, navigation)
- [storybook-workflow/](storybook-workflow/): Create and maintain Storybook stories with variants and smoke testing
- [i18n-workflow/](i18n-workflow/): Two-tier i18n system for app strings and template-specific strings
- [icon-system/](icon-system/): Add and use Phosphor icons via Iconify with semantic registry
- [workflow-third-party-libraries/](workflow-third-party-libraries/): Guidelines for adding and isolating external dependencies

## Architecture

- [understand-architectural-decisions/](understand-architectural-decisions/): How to verify changes against ADRs stored in memory/decisions/.

## Tooling

- [ensure-browser-automation/](ensure-browser-automation/): Verifying and starting Chromium for Vitest Browser Mode or research tasks.
