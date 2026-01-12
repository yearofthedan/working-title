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

## 🔗 Tool Integration

- `.roo/rules/` → Symlink to `.agents/rules/` (loaded by all modes)
- `.roo/rules-code/` → Symlink to `.agents/rules-code/` (loaded by Code mode)
- `.roo/rules-debug/` → Symlink to `.agents/rules-code/` (loaded by Debug mode; shares rules with Code mode)
- Direct access via `.agents/` for all other tools

## 🚀 Quick Start for AI Assistants

### All Modes
1. Read this file first for navigation
2. Check [domain.md](.agents/rules/domain.md) for business context
3. Review [architecture.md](.agents/rules/architecture.md) for structure and patterns
4. Check [tech-stack.md](.agents/rules/tech-stack.md) for technology constraints

### Code & Debug Modes (Additional)
5. Review [Contributing](.agents/rules-code/contributing.md) for advice for making changes
6. Review [code-style.md](.agents/rules-code/code-style.md) for implementation standards
7. Reference [testing.md](.agents/rules-code/testing.md) and [styling.md](.agents/rules-code/styling.md) as needed
