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

**Core workflows**: [`workflow-general`](.roo/skills/workflow-general/), [`workflow-functional-changes`](.roo/skills/workflow-functional-changes/), [`workflow-vue-components`](.roo/skills/workflow-vue-components/)

### Memory System (`memory/`)

Project planning and architectural decisions:

- [Planning](memory/planning/README.md) - Roadmap, backlog, active feature plans
- [Decisions](memory/decisions/index.md) - ADRs documenting architectural choices

### Mode-Specific Rules

- [Orchestrator workflow](.roo/rules-orchestrator/workflow.md) - Subtask completion protocol
- [Agent Tuner skills](.roo/skills-agent-tuner/) - Skills for optimizing agent setups

## 🎯 Quick Start

1. **Starting a feature?** Check [memory/planning/backlog.md](memory/planning/backlog.md)
2. **Writing code?** Load [`workflow-general`](.roo/skills/workflow-general/SKILL.md)
3. **Need architecture context?** Review [memory/decisions/](memory/decisions/index.md)
4. **Building components?** Use [`workflow-vue-components`](.roo/skills/workflow-vue-components/SKILL.md)
