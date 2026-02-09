# Architectural Handover: Domain-Driven Content Scoping

## Project Context

The application is a narrative development tool using the Snowflake Method. We are refactoring the storage and UI architecture to support large projects by introducing semantic "scopes" for different writing tasks.

## Current Progress: Phase 1 (Completed)

We have successfully implemented **Domain-Driven Content Scoping** in the template system.

### Changes Implemented:

1.  **Schema Update**: Added `StepScope` to [`src/features/process-templates/processTemplate.ts`](src/features/process-templates/processTemplate.ts).
    - `field`: Metadata/tags (e.g., Genre, Status).
    - `paragraph`: Concise blocks (e.g., One-sentence summary).
    - `page`: Focused profiles/notes (e.g., Minor character bio).
    - `multi-page`: Narrative drafts/long-form (e.g., Full chapter, Major character arc).
2.  **Template Tagging**: All steps in the Snowflake template ([`src/features/process-templates/snowflake/template.ts`](src/features/process-templates/snowflake/template.ts)) are now tagged with appropriate scopes.
3.  **Test Infrastructure**: `StepDefinitionBuilder` ([`src/features/process-templates/__testHelpers__/builders.ts`](src/features/process-templates/__testHelpers__/builders.ts)) updated to include `scope`.

## Objective for Phase 2: Contextual Rendering & UI Strategy

The goal is to determine how the UI should differentiate rendering based on these scopes.

### Key Questions for Q&A:

1.  **Sidebar vs. Dedicated View**: Should `field` and `paragraph` always stay in a fixed sidebar "Context Panel", while `page` and `multi-page` trigger a route change to a dedicated editor?
2.  **Editor Specialization**: Do `field` and `paragraph` need the full Tiptap rich-text experience, or should they move toward plain-text/inline inputs to reduce UI weight?
3.  **Canvas Interaction**: How should clicking a `multi-page` node on the canvas differ from clicking a `field`? (e.g., Open in Sidebar vs. "Dive In" to full-screen mode).
4.  **Routing Architecture**: Should we introduce nested routes like `/project/:id/edit/:stepId` for high-scope steps?

## Future Roadmap (Phase 3)

- **Multi-File Storage**: Partitioning the project into multiple JSON files based on these scopes (e.g., `chapters/` and `characters/` folders) using the File System Access API.

## Relevant Files

- [`src/features/process-templates/processTemplate.ts`](src/features/process-templates/processTemplate.ts) (Schema)
- [`src/features/process-templates/snowflake/template.ts`](src/features/process-templates/snowflake/template.ts) (Definitions)
- [`src/features/writing-project/project-sidebar/ProjectSidebar.vue`](src/features/writing-project/project-sidebar/ProjectSidebar.vue) (Current inline editor)
- [`memory/decisions/active/adr-007-file-storage-architecture.md`](memory/decisions/active/adr-007-file-storage-architecture.md) (Architecture baseline)
