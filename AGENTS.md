# AI Agent Context & Rules

This project uses a universal Context Engineering system to provide consistent
guidance to AI assistants like Roo and others.

## 📂 Structure

### Always-Loaded Rules (`.roo/rules/`)

High-level principles loaded for all agents:

- [Architecture](.roo/rules/architecture.md) - Guiding patterns, directory structure, feature isolation
- [Domain Concepts](.roo/rules/domain.md) - Core terminology and application purpose
- [Tech Stack](.roo/rules/tech-stack.md) - Core technologies and libraries

### On-Demand Skills (`.roo/skills/`)

Executable workflows loaded when relevant. See [Skills README](.roo/skills/README.md) for full catalog.

**Core workflows**: [`workflow-general`](.roo/skills/workflow-general/), [`workflow-functional-changes`](.roo/skills/workflow-functional-changes/), [`workflow-vue`](.roo/skills/workflow-vue/), [`storybook-workflow`](.roo/skills/storybook-workflow/)

### Documentation (`docs/`)

Project documentation, planning, and architectural decisions:

- [Planning](docs/planning/README.md) - Roadmap, backlog, active feature plans
- [Decisions](docs/decisions/index.md) - ADRs documenting architectural choices
- [Guides](docs/guides/) - Practical guides for common tasks (icons, i18n, testing, styling)

### Mode-Specific Rules

- [Orchestrator workflow](.roo/rules-orchestrator/workflow.md) - Subtask completion and skill handover
- [Architect handover](.roo/rules-architect/handover.md) - Clear specification for implementation modes
- [Code mode skill loading](.roo/rules-code/skill-loading.md) - Skill discovery and loading protocol
- [Agent Tuner skills](.roo/skills-agent-tuner/) - Skills for optimizing agent setups

### Important: Skills and Mode Switching

**Critical**: Mode switching in conversations doesn't re-scan for skills. Implementation modes (code, debug) must explicitly load relevant skills from [`.roo/skills/`](.roo/skills/) using `read_file` when starting work. See [skill loading protocol](.roo/rules-code/skill-loading.md).

### Internationalization (i18n)

User-facing strings must not be hardcoded. Use the two-tier i18n system:
- **App Strings**: Core UI in [`src/i18n/en.json`](src/i18n/en.json)
- **Template Strings**: Methodology strings in `src/features/process-templates/{template}/locales/en.json`
- **Guide**: See [`i18n-workflow`](docs/guides/i18n.md) for detailed patterns and troubleshooting.

## 🎯 Quick Start

1. **Starting a feature?** Check [docs/planning/backlog.md](docs/planning/backlog.md)
2. **Writing code?** Load [`workflow-general`](.roo/skills/workflow-general/SKILL.md)
3. **Need architecture context?** Review [docs/decisions/](docs/decisions/index.md)
4. **Building components?** Use [`workflow-vue`](.roo/skills/workflow-vue/SKILL.md)
5. **Need practical guidance?** Check [docs/guides/](docs/guides/) for icons, i18n, testing, and styling
