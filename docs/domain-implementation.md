# Domain Implementation

Technical domain patterns and implementation details for the narrative development tool.

## Technical Domain Patterns

### Process Template Pattern

Templates are declarative configurations that drive the UI and validation logic.
They are separate from the project data, allowing the same data to be viewed
through different template "lenses."

### View Model Transformation

Raw project data is transformed into view-specific models:

- **Canvas**: Steps → Graph nodes with positions, sizes, and visual properties
- **Sidebar**: Steps → Ordered list with labels and instructions

See [`src/features/writing-project/view-model/useProjectViewModel.ts`](../src/features/writing-project/view-model/useProjectViewModel.ts)

### Graph Partitioning by Tracks

Steps are organized into vertical tracks using graph partitioning algorithms.
Each track represents a narrative thread (main plot, character arcs, world-building).

See [`src/utils/graphs.ts`](../src/utils/graphs.ts) and [`src/features/writing-project/utils/elkLayoutAdapter.ts`](../src/features/writing-project/utils/elkLayoutAdapter.ts)

## Implementation Notes

### Current Template: Snowflake Method

The primary template implements Randy Ingermanson's Snowflake Method for novel planning.
Steps progress from a one-sentence summary to full scene-by-scene outlines.

**File**: [`src/features/process-templates/snowflake/template.ts`](../src/features/process-templates/snowflake/template.ts)

### Demo Data

Sample project data is available for testing:
**File**: [`src/features/demo/project-data.ts`](../src/features/demo/project-data.ts)

## When Working on Features

### Adding New Step Types

1. Add step definition to template
2. Ensure step has `category`, `labelText`, and `ui.visibility`
3. Add i18n strings for labels and instructions

### Modifying Canvas Layout

- Layout is calculated by elkjs (automatic graph layout library)
- Track configuration controls vertical grouping
- Node sizes are measured dynamically via ResizeObserver

### Editing Content

- Rich text: Tiptap editor with StarterKit
- Plain text: Textarea with Tailwind styling
- All content stored as HTML strings in `step.content.text`

## Further Reading

- **[Domain Concepts](domain.md)**: Core terminology and application purpose
- **[Tech Stack](tech-stack.md)**: Technologies and libraries used
- **[Architecture](architecture.md)**: Overall system design and conventions
