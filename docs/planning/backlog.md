# Backlog

Prioritized list of future enhancements and fixes.

## High Priority (Next)

- [ ] **Tech Debt**: Refactor `useProjectViewModel.ts` to improve testability.
- [ ] **Persistence**: Support writing and loading from the local file system
- [ ] **Errors**: App level error handling, and reusable error component

## Medium Priority

- [ ] **UX**: Make the nodes show when editing more clearly
- [ ] **Observability**: Extract logging into wrapper for future utility imtegration, and reduced test noise
- [ ] **UX**: Add navigation support between nodes to quickly move to parents and siblings
- [ ] **UX**: Add a details slide out that allows more complex editing features while still navigating the canvas
- [ ] **i18n**: Add language switcher UI to allow runtime language changes.
- [ ] **i18n**: Support non-English languages (e.g., Spanish, French).
- [ ] **Validation**: Implement "Incomplete Step" indicators on the canvas.
- [ ] **UX**: Visually distinguish tracks in the canvas
- [ ] **UX**: Add keyboard shortcuts for common actions (New Step, Delete, Save).

## Low Priority (Ideas)

- [ ] **UX**: Add undo/redo support for canvas operations.
- [ ] **Export**: Basic PDF export for the story outline.

## Bugs / Fixes

- [ ] Fix: Tiptap focus issue when clicking between nodes.
- [ ] Fix: Edge case where ELK layout fails on circular connections. Should not happen, but currently don't handle if it does.

## Completed

- [x] **i18n**: Implementation of two-tier i18n architecture (Phase 1-6).
