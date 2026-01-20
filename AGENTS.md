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
- **[Domain Implementation](.agents/rules-code/domain-implementation.md)** - Technical patterns and implementation notes
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

### Ask Mode
1. **[Domain Concepts](.agents/rules/domain.md)** - Understand the business domain and terminology
2. **[Architecture](.agents/rules/architecture.md)** - Learn the structural patterns
3. **[Memory/Gotchas](.agents/memory/gotchas.md)** - Check for known issues and troubleshooting

### Architect Mode
1. **[All Ask Mode files](#ask-mode)**
2. **[Architectural Decisions](.agents/memory/decisions/index.md)** - Review rationale behind the system design
3. **[Planning](.agents/planning/README.md)** - Understand current roadmap and project direction
4. **On-Demand Reference**: Use `read_file` on `.agents/rules-code/` files when specifying deep technical requirements (e.g., testing APIs or specific code styles).

### Code & Debug Modes
1. **[All Ask Mode files](#ask-mode)**
2. **[Code Style](.agents/rules-code/code-style.md)** - Review implementation standards
3. **[Testing Rules](.agents/rules-code/testing.md)** - Technical patterns for Vitest and Storybook
4. **[Memory Patterns](.agents/memory/patterns/index.md)** - Established code patterns
5. **[Skills](.agents/skills/README.md)** - Procedural step-by-step workflows

### Orchestrator Mode
1. **[All Ask Mode files](#ask-mode)**
2. **[Workflow](.agents/rules-orchestrator/workflow.md)** - Subtask sequencing protocol
3. **[Roadmap](.agents/planning/roadmap.md)** and **[Backlog](.agents/planning/backlog.md)** - Project context and priorities
