# Feature Specification: Step Panel (Detail View)

**Status:** In Progress (Vertical Slicing)
**Target Mode:** Code
**Created:** 2026-02-07
**Updated:** 2026-02-08

## Overview

**What:** A slide-in panel (`StepPanel`) that opens on the right side when users click `page` or `multi-page` scoped steps, providing a dedicated Tiptap editor for focused content editing.

**Why:** Large-scope content (character profiles, scene drafts, chapter notes) needs dedicated editing space beyond what inline canvas editing can provide. This enables writers to work on detailed content while maintaining visual context of their narrative structure.

**Who:** Writers using the Snowflake Method who need to switch between high-level graph navigation and deep content editing.

**Success Criteria:**

- Users can open `page` and `multi-page` steps into a dedicated editor
- Step panel provides more writing space than inline canvas editing
- Canvas remains navigable while panel is open
- Left sidebar can be manually restored for context reference while editing

## Architectural Decisions

### Three-Panel Layout with Auto-Collapse

**Decision:** Implement a dynamic three-panel layout: Left Context Sidebar + Canvas + Right Detail Panel

**Rationale:**

- Maintains spatial consistency - users always know where to find features
- Auto-collapsing left sidebar maximizes writing space when focusing on detailed content
- Canvas remains visible for narrative structure context
- Similar to VSCode, Figma, and Linear's proven UX patterns

**Tradeoffs:**

- Slightly more complex state management (tracking which panels are open)
- Need to handle responsive behavior on smaller screens
- Accepted because the flexibility benefits writers working with various content types

### Scope-Based Triggering

**Decision:** Only `page` and `multi-page` scoped nodes trigger the detail panel when clicked. `field` and `paragraph` scoped nodes remain inline-editable on canvas.

**Rationale:**

- Natural mapping: short content (field/paragraph) stays in quick-access areas, long content (page/multi-page) gets dedicated space
- Aligns with the semantic meaning of content scopes defined in Phase 1
- Prevents UI clutter from opening detail panel for metadata fields

**Alternatives Considered:**

- Open detail panel for all scopes: Rejected - overkill for simple fields
- User chooses per-click (double-click vs single-click): Rejected - adds cognitive overhead

### Map vs. Editor Pattern (Preview Only)

**Decision:** `page` and `multi-page` scoped nodes on the canvas are **read-only previews**. All editing for these scopes happens exclusively in the detail panel.

**Rationale:**

- Creates a clear mental model: Canvas is for "Mapping/Structuring," Detail Panel is for "Writing/Editing."
- Prevents the unwieldy experience of trying to manage long-form content within the constrained boundaries of a canvas node.
- Avoids UI complexity of switching between inline and panel editing.

**Trigger:** Clicking the body of a `page` or `multi-page` node on the canvas triggers the detail panel.

### Fixed Node Height

**Decision:** `page` and `multi-page` nodes will have a **fixed, generous height** (e.g., 320px) on the canvas to act as consistent preview cards.

**Rationale:**

- Keeps the narrative graph orderly and predictable.
- Provides enough space for a meaningful preview of the content without overwhelming the canvas.
- Future-proofing: Different scopes can eventually have specific fixed heights to act as structural guides.

### Rich Text Editor

**Decision:** Use Tiptap rich text editor in the detail panel for both `page` and `multi-page` content.

**Rationale:**

- Writers need basic formatting (bold, italic, lists, headings) for character bios, scene notes, and narrative drafts
- Tiptap is already successfully integrated in the canvas inline editors
- Maintains editing consistency across the application
- Supports copy/paste from word processors

**Not Needed Yet:** Custom formatting toolbar can be deferred - use Tiptap's default StarterKit initially.

## Vertical Slices

### Slice 1: Panel Visibility & Structural Shell (Completed)

**Goal:** User can open and close an empty panel with a sliding animation.

- [x] Create `StepPanel.vue` with basic `aside` layout and slide transition
- [x] Create `useDetailPanel.ts` composable for visibility state (`isOpen`, `activeStepId`)
- [x] Implement Close button with basic functionality
- [x] Component tests and Storybook for visibility states

### Slice 2: Header & Context Integration (Completed)

**Goal:** Panel displays the correct step title and integrates with the project's i18n/definitions context.

- [x] Update `StepPanel.vue` to resolve `definition.labelText` via `useDefinitionsContext`
- [x] Ensure `StepPanel` has access to `useActiveProjectContext` to find the current step
- [x] Acceptance: Panel opens with "One Sentence Summary" (or relevant label) in the header.
- [x] Verification: Component test verifies header text matches step definition.

### Slice 3: Rich Text Editing & Persistence (Completed)

**Goal:** User can edit step content using the Tiptap editor within the panel with auto-save.

- [x] Integrate Tiptap editor into `StepPanel.vue`
- [x] Extract `useStepEditor` composable to unify Tiptap logic across Panel and Canvas
- [x] Implement debounced auto-save via `useActiveProjectContext`
- [x] Acceptance: User types in panel -> content updates in project data.
- [x] Verification: Component test for editor initialization and debounced persistence.

### Slice 4: Canvas Triggering & Scope Enforcement

**Goal:** Clicking specific canvas nodes triggers the panel.

- [ ] Modify `ProjectCanvas.vue` to emit `openPanel` when `page` or `multi-page` nodes are clicked
- [ ] Enforce read-only state for these nodes on the canvas
- [ ] Acceptance: Click a "Scene" node -> Panel opens with Scene content.
- [ ] Verification: Integration test in `WritingProject.spec.ts`.

### Slice 5: Layout Choreography (Sidebar Collapse)

**Goal:** Maximize writing space by auto-collapsing the left sidebar.

- [ ] Implement sidebar collapse logic in `WritingProject.vue` when `isOpen` is true
- [ ] Add toggle button to collapsed sidebar state
- [ ] Acceptance: Opening panel hides sidebar; clicking toggle restores it.
- [ ] Verification: Storybook interaction test for layout states.

### Slice 6: Focus & Keyboard UX

**Goal:** Seamless transition between canvas and panel.

- [ ] Auto-focus Tiptap editor when panel opens
- [ ] Implement ESC key to close panel
- [ ] Acceptance: Click node -> immediately start typing; press ESC -> panel closes.
- [ ] Verification: Accessibility test for focus management.

## Technical Details

### Location

- All panel-related logic is collocated in [`src/features/writing-project/step-panel/`](../../src/features/writing-project/step-panel/)

### State Management

```typescript
// useDetailPanel.ts
interface DetailPanelState {
  isOpen: boolean
  activeStepId: string | null
}
```

### UI Structure (`StepPanel.vue`)

- **Header:** Node label (i18n) + Close button (`AppIcon` "close")
- **Content Area:** Tiptap editor instance (managed by `useStepEditor`), full height, `overflow-y-auto`

### Shared Logic

- **`useStepEditor.ts`**: Unified Tiptap lifecycle, debounced updates, and content synchronization. Used by both `StepPanel` and `CanvasStep`.

## Out of Scope

- Multiple detail panels (only one active)
- Panel resizing (fixed width ~400px)
- Routing/URL persistence for panel state
- Mobile/Tablet responsive layout (Desktop first)

## References

- **Scope Definition:** [`processTemplate.ts`](../../src/features/process-templates/processTemplate.ts:13) - `StepScope` type
- **Existing Tiptap Pattern:** [`CanvasStep.vue`](../../src/features/writing-project/project-canvas/canvas-step/CanvasStep.vue)
- **Current Layout:** [`WritingProject.vue`](../../src/features/writing-project/WritingProject.vue)
