# AI Agent Context & Rules

This project uses a universal Context Engineering system to provide consistent
guidance to AI assistants like Roo and others.

## 📂 Structure

All agent context lives in the `.agents/` directory:

### Common Rules (All Modes)

- **[Architecture](.agents/rules/architecture.md)** - Feature isolation, patterns, structure
- **[Budget](.agents/rules/budget.md)** - Resource usage limits
- **[Domain](.agents/rules/domain.md)** - Product context and domain terminology
- **[Tech Stack](.agents/rules/tech-stack.md)** - Vue 3, TypeScript, pnpm, Vite

### Code-Specific Rules (Code & Debug Modes)

- **[Contributing](.agents/rules-code/contributing.md)** - General advice for making changes
- **[Code Style](.agents/rules-code/code-style.md)** - Vue conventions, naming, TypeScript patterns
- **[Testing](.agents/rules-code/testing.md)** - Vitest and Storybook patterns
- **[Styling](.agents/rules-code/styling.md)** - Tailwind CSS v4 and theming
- **[i18n](.agents/rules-code/i18n.md)** - Internationalization rules

### Orchestrator-Specific Rules (Orchestrator Mode Only)

- **[Workflow](.agents/rules-orchestrator/workflow.md)** - Subtask sequencing and completion protocol

### Memory (Session-Persistent Knowledge)

- **[Overview](.agents/memory/README.md)**
- **[Decisions](.agents/memory/decisions/index.md)** - Architectural Decision Records
  - [Active ADRs](.agents/memory/decisions/active/) - Current decisions
- **[Patterns](.agents/memory/patterns/index.md)** - Code patterns by topic
  - [Vue Components](.agents/memory/patterns/vue-components.md)
  - [Composables](.agents/memory/patterns/composables.md)
  - [Testing](.agents/memory/patterns/testing.md)
  - [Data Management](.agents/memory/patterns/data-management.md)
- **[Gotchas](.agents/memory/gotchas.md)** - Known issues and workarounds

### Planning (Future Work)

- **[Overview](.agents/planning/README.md)**
- **[Roadmap](.agents/planning/roadmap.md)** - High-level phases
- **[Backlog](.agents/planning/backlog.md)** - Specific future enhancements
- **[Templates](.agents/planning/templates/feature-plan-template.md)** - Planning templates

### Skills (How-To Procedures)

- **[Overview](.agents/skills/README.md)**
- **[Update Component (TDD)](.agents/skills/update-component-tdd.md)**
- **[Add Feature Module](.agents/skills/add-feature-module.md)**
- **[Extract Component](.agents/skills/extract-component.md)**
- **[Debug Test Failure](.agents/skills/debug-test-failure.md)**
- **[Create Page Object](.agents/skills/create-page-object.md)**

## 🔗 Tool Integration

- `.roo/rules/` → Symlink to `.agents/rules/` (loaded by all modes)
- `.roo/rules-code/` → Symlink to `.agents/rules-code/` (loaded by Code mode)
- `.roo/rules-debug/` → Symlink to `.agents/rules-code/` (loaded by Debug mode; shares rules with Code mode)
- `.roo/rules-orchestrator/` → Symlink to `.agents/rules-orchestrator/` (loaded by Orchestrator mode)
- Direct access via `.agents/` for all other tools

## 🚀 Quick Start for AI Assistants

### All Modes
1. Read this file first for navigation
2. Check [domain.md](.agents/rules/domain.md) for business context
3. Review [architecture.md](.agents/rules/architecture.md) for structure and patterns
4. Check [tech-stack.md](.agents/rules/tech-stack.md) for technology constraints
5. Review [Memory](.agents/memory/README.md) for recent decisions and gotchas

### Code & Debug Modes (Additional)
6. Review [Contributing](.agents/rules-code/contributing.md) for advice for making changes
7. Review [code-style.md](.agents/rules-code/code-style.md) for implementation standards
8. Reference [Testing](.agents/memory/patterns/testing.md) and [Skills](.agents/skills/README.md) as needed

### Orchestrator-Specific Rules (Orchestrator Mode Only)
9. Review [workflow.md](.agents/rules-orchestrator/workflow.md) for subtask sequencing patterns
10. Check [Roadmap](.agents/planning/roadmap.md) and [Backlog](.agents/planning/backlog.md) for project context
