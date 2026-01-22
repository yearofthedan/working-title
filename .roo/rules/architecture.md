# Architecture

## Guiding Principles

1. **Domain-Driven Design**: Feature modules align with domain boundaries
2. **UI-Centric Canvas Application**: Visual graph editing is the primary interaction model
3. **User Data Ownership**: All project data stays client-side; users control their content

## Directory Structure

- `src/utils/`: Pure utility logic (arrays, dates, graphs, objects)
- `src/features/common/`: Global UI primitives and shared components
- `src/features/[feature-name]/`: Self-contained domain modules
- `public/`: Static assets

## Key Patterns

- **Feature Isolation**: No cross-feature imports
- **Performance**: Async loading for heavy dependencies
