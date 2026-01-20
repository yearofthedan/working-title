# Domain Context

## Application Purpose

This application is a narrative development tool that helps writers plan and structure
stories using established creative writing methodologies. The primary implementation
is the Snowflake Method, a step-by-step approach to novel writing.

## Core Concepts

### Project

A writer's story being developed. Contains:

- **Steps**: Individual writing tasks (sentence summary, character descriptions, scenes)
- **Connections**: Relationships showing narrative flow between steps
- **Template**: The methodology being followed (e.g., Snowflake v1)

See [`src/features/story/types.ts`](../../src/features/story/types.ts) for the data model.

### Template

A structured writing methodology defining the process. Contains:

- **Step Definitions**: All possible writing tasks in this methodology
- **Actions**: What the writer can do from each step (append, advance, connect)
- **Tracks**: Vertical groupings for visual organization
- **Validations**: Rules ensuring the story structure is complete

See [`src/features/process-templates/processTemplate.ts`](../../src/features/process-templates/processTemplate.ts) for the schema.

### Step

An individual writing task with editable content. Properties:

- **stepId**: References a step definition in the template
- **content**: HTML/Markdown text from the editor
- **connections**: Links to other steps showing narrative relationships

### Canvas vs Sidebar

The same project data is displayed in two ways:

- **Canvas**: Visual graph showing step relationships and narrative flow
- **Sidebar**: Text-focused interface for detailed content editing

Both views are synchronized and update the same underlying project data.

## Technical Domain Patterns

### Process Template Pattern

Templates are declarative configurations that drive the UI and validation logic.
They are separate from the project data, allowing the same data to be viewed
through different template "lenses."

### View Model Transformation

Raw project data is transformed into view-specific models:

- **Canvas**: Steps → Graph nodes with positions, sizes, and visual properties
- **Sidebar**: Steps → Ordered list with labels and instructions

See [`src/features/story-canvas/composables/useProjectViewModel.ts`](../../src/features/story-canvas/composables/useProjectViewModel.ts)

### Graph Partitioning by Tracks

Steps are organized into vertical tracks using graph partitioning algorithms.
Each track represents a narrative thread (main plot, character arcs, world-building).

See [`src/utils/graphs.ts`](../../src/utils/graphs.ts) and [`src/features/story-canvas/utils/elkLayoutAdapter.ts`](../../src/features/story-canvas/utils/elkLayoutAdapter.ts)

## Terminology Guide

To avoid confusion, note these domain-specific meanings:

| Term           | Domain Meaning                       | Common Tech Meaning                |
| -------------- | ------------------------------------ | ---------------------------------- |
| **Step**       | A writing task                       | Wizard step, build step            |
| **Stage**      | Progress indicator (1, 2, 3)         | Deployment environment             |
| **Track**      | Vertical column in layout            | Audio track, tracking pixel        |
| **Node**       | Visual representation of a step      | Server node, tree node             |
| **Connection** | Narrative relationship between steps | Network connection, API connection |
| **Template**   | Writing methodology                  | Code template, HTML template       |
| **Canvas**     | Visual graph editor                  | HTML5 Canvas element               |

## Implementation Notes

### Current Template: Snowflake Method

The primary template implements Randy Ingermanson's Snowflake Method for novel planning.
Steps progress from a one-sentence summary to full scene-by-scene outlines.

**File**: [`src/features/snowflake/template.ts`](../../src/features/snowflake/template.ts)

### Demo Data

Sample project data is available for testing:
**File**: [`src/features/demo/project-data.ts`](../../src/features/demo/project-data.ts)

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
