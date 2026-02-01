# AI Agent Context & Rules

This project uses a universal Context Engineering system to provide consistent
guidance to AI assistants like Roo and others.

## 📂 Structure

### Always-Loaded Rules (`.roo/rules/`)

High-level principles loaded for all agents:

- [Architecture](.roo/rules/architecture.md) - Guiding patterns, directory structure, feature isolation
- [Domain Concepts](.roo/rules/domain.md) - Core terminology and application purpose
- [Domain Implementation](.roo/rules/domain-implementation.md) - Technical patterns and current template
- [Tech Stack](.roo/rules/tech-stack.md) - Core technologies and libraries

### On-Demand Skills (`.roo/skills/`)

Executable workflows loaded when relevant. See [Skills README](.roo/skills/README.md) for full catalog.

**Core workflows**: [`workflow-general`](.roo/skills/workflow-general/), [`workflow-functional-changes`](.roo/skills/workflow-functional-changes/), [`workflow-vue-components`](.roo/skills/workflow-vue-components/), [`storybook-workflow`](.roo/skills/storybook-workflow/)

### Memory System (`memory/`)

Project planning and architectural decisions:

- [Planning](memory/planning/README.md) - Roadmap, backlog, active feature plans
- [Decisions](memory/decisions/index.md) - ADRs documenting architectural choices

### Mode-Specific Rules

- [Orchestrator workflow](.roo/rules-orchestrator/workflow.md) - Subtask completion and skill handover
- [Architect handover](.roo/rules-architect/handover.md) - Clear specification for implementation modes
- [Code mode skill loading](.roo/rules-code/skill-loading.md) - Skill discovery and loading protocol
- [Agent Tuner skills](.roo/skills-agent-tuner/) - Skills for optimizing agent setups

### Important: Skills and Mode Switching

**Critical**: Mode switching in conversations doesn't re-scan for skills. Implementation modes (code, debug) must explicitly load relevant skills from [`.roo/skills/`](.roo/skills/) using `read_file` when starting work. See [skill loading protocol](.roo/rules-code/skill-loading.md).

### Internationalization (i18n)

User-facing strings must not be hardcoded. Use the two-tier i18n system:
- **App Strings**: Core UI in [`src/locales/en.json`](src/locales/en.json)
- **Template Strings**: Methodology strings in `src/features/process-templates/{template}/locales/en.json`
- **Guide**: See [`i18n-workflow`](.roo/skills/i18n-workflow/SKILL.md) for detailed patterns and troubleshooting.

## 🎯 Quick Start

1. **Starting a feature?** Check [memory/planning/backlog.md](memory/planning/backlog.md)
2. **Writing code?** Load [`workflow-general`](.roo/skills/workflow-general/SKILL.md)
3. **Need architecture context?** Review [memory/decisions/](memory/decisions/index.md)
4. **Building components?** Use [`workflow-vue-components`](.roo/skills/workflow-vue-components/SKILL.md)
