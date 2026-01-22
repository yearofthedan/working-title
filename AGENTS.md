# AI Agent Context & Rules

This project uses a universal Context Engineering system to provide consistent
guidance to AI assistants like Roo and others.

## 📂 Structure

All agent context lives in the `.roo/` directory:

### Common Rules (All Modes)

- **[Architecture](.roo/rules/architecture.md)** - Feature isolation, patterns, structure
- **[Budget](.roo/rules/budget.md)** - Resource usage limits
- **[Domain](.roo/rules/domain.md)** - Product context and domain terminology
- **[Tech Stack](.roo/rules/tech-stack.md)** - Vue 3, TypeScript, pnpm, Vite

### Code-Specific Rules (Code & Debug Modes)

- **[Contributing](.roo/rules-code/contributing.md)** - General advice for making changes
- **[Domain Implementation](.roo/rules-code/domain-implementation.md)** - Technical patterns and implementation notes
- **[Code Style](.roo/rules-code/code-style.md)** - Vue conventions, naming, TypeScript patterns
- **[Testing](.roo/rules-code/testing.md)** - Vitest and Storybook patterns
- **[Styling](.roo/rules-code/styling.md)** - Tailwind CSS v4 and theming
- **[i18n](.roo/rules-code/i18n.md)** - Internationalization rules

### Orchestrator-Specific Rules (Orchestrator Mode Only)

- **[Workflow](.roo/rules-orchestrator/workflow.md)** - Subtask sequencing and completion protocol

### Memory (Session-Persistent Knowledge)

- **[Overview](.roo/memory/README.md)**
- **[Decisions](.roo/memory/decisions/index.md)** - Architectural Decision Records
  - [Active ADRs](.roo/memory/decisions/active/) - Current decisions
- **[Patterns](.roo/memory/patterns/index.md)** - Code patterns by topic
  - [Vue Components](.roo/memory/patterns/vue-components.md)
  - [Composables](.roo/memory/patterns/composables.md)
  - [Testing](.roo/memory/patterns/testing.md)
  - [Data Management](.roo/memory/patterns/data-management.md)
- **[Gotchas](.roo/memory/gotchas.md)** - Known issues and workarounds

### Planning (Future Work)

- **[Overview](.roo/planning/README.md)**
- **[Roadmap](.roo/planning/roadmap.md)** - High-level phases
- **[Backlog](.roo/planning/backlog.md)** - Specific future enhancements
- **[Templates](.roo/planning/templates/feature-plan-template.md)** - Planning templates

### Skills (How-To Procedures)

- **[Overview](.roo/skills/README.md)**
- **[Update Component (TDD)](.roo/skills/update-component-tdd.md)**
- **[Add Feature Module](.roo/skills/add-feature-module.md)**
- **[Extract Component](.roo/skills/extract-component.md)**
- **[Debug Test Failure](.roo/skills/debug-test-failure.md)**
- **[Create Page Object](.roo/skills/create-page-object.md)**

## 🔗 Roo Cline Integration

Roo Cline auto-loads rules from `.roo/` based on the active mode:

- `.roo/rules/` → Loaded by all modes (common rules)
- `.roo/rules-code/` → Loaded by Code mode only
- `.roo/rules-debug/` → Loaded by Debug mode only (shares with Code mode)
- `.roo/rules-orchestrator/` → Loaded by Orchestrator mode only

All other resources (memory, planning, skills) are accessed directly via `.roo/` paths.

## 🚀 Quick Start for AI Assistants

### Ask Mode
1. **[Domain Concepts](.roo/rules/domain.md)** - Understand the business domain and terminology
2. **[Architecture](.roo/rules/architecture.md)** - Learn the structural patterns
3. **[Memory/Gotchas](.roo/memory/gotchas.md)** - Check for known issues and troubleshooting

### Architect Mode
1. **[All Ask Mode files](#ask-mode)**
2. **[Architectural Decisions](.roo/memory/decisions/index.md)** - Review rationale behind the system design
3. **[Planning](.roo/planning/README.md)** - Understand current roadmap and project direction
4. **On-Demand Reference**: Use `read_file` on `.roo/rules-code/` files when specifying deep technical requirements (e.g., testing APIs or specific code styles).

### Code & Debug Modes
1. **[All Ask Mode files](#ask-mode)**
2. **[Code Style](.roo/rules-code/code-style.md)** - Review implementation standards
3. **[Testing Rules](.roo/rules-code/testing.md)** - Technical patterns for Vitest and Storybook
4. **[Memory Patterns](.roo/memory/patterns/index.md)** - Established code patterns
5. **[Skills](.roo/skills/README.md)** - Procedural step-by-step workflows

### Orchestrator Mode
1. **[All Ask Mode files](#ask-mode)**
2. **[Workflow](.roo/rules-orchestrator/workflow.md)** - Subtask sequencing protocol
3. **[Roadmap](.roo/planning/roadmap.md)** and **[Backlog](.roo/planning/backlog.md)** - Project context and priorities
