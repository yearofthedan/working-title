# AI Agent Context & Rules

This project uses a universal Context Engineering system to provide consistent
guidance to AI assistants like Roo, Cursor, and others.

## 📂 Structure

All agent context lives in the `.agents/` directory:

- **[Tech Stack](.agents/rules/tech-stack.md)** - Vue 3, TypeScript, pnpm, Vite
- **[Architecture](.agents/rules/architecture.md)** - Feature isolation, patterns, structure
- **[Code Style](.agents/rules/code-style.md)** - Vue conventions, naming, templates
- **[Domain](.agents/rules/domain.md)** - Product context and domain terminology
- **[Styling](.agents/rules/styling.md)** - Tailwind CSS v4 and theming
- **[Testing](.agents/rules/testing.md)** - Vitest and Storybook patterns
- **[Advanced Patterns](.agents/rules/advanced-patterns.md)** - Specialized Vue and architectural patterns
- **[Behaviours](.agents/rules/behaviours.md)** - Agent behavioral guidelines
- **[Budget](.agents/rules/budget.md)** - Resource usage limits

## 🔗 Tool Integration

- `.roo/` → Symlink to `.agents/` for Roo
- `.cursor/` → Symlink to `.agents/` for Cursor
- Direct access via `.agents/` for all other tools

## 🚀 Quick Start for AI Assistants

1. Read this file first for navigation
2. Review [behaviours.md](.agents/rules/behaviours.md) for core principles
3. Check [tech-stack.md](.agents/rules/tech-stack.md) for technology constraints
4. Reference other files as needed for specific guidance
