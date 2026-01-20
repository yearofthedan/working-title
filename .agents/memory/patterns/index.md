# Pattern Catalog

This catalog provides a quick reference to established implementation patterns in the project.

## Patterns by Category

| Category    | Pattern         | Description                        | Link                                     |
| ----------- | --------------- | ---------------------------------- | ---------------------------------------- |
| **UI**      | Vue Component   | Component structure and naming     | [vue-components.md](vue-components.md)   |
| **Logic**   | Composable      | Reactive logic and side effects    | [composables.md](composables.md)         |
| **Quality** | Testing         | Unit and integration test patterns | [testing.md](testing.md)                 |
| **Data**    | Data Management | Spec-driven data handling          | [data-management.md](data-management.md) |

## Quick Reference

- **Feature-first**: Always put code in a feature module if it's domain-specific.
- **Spec-driven**: Define the shape of your data in a `.ts` file before implementing.
- **TDD-leaning**: Write tests for complex logic or critical components.
