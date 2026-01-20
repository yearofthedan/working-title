# Gotchas

Known issues, non-obvious constraints, and their solutions.

## UI & Layout

### Tiptap Initialization in Vue Flow

- **Problem**: Tiptap editors inside Vue Flow nodes may not initialize correctly or capture focus properly.
- **Solution**: Use the "Dormant Component" pattern (ADR-003). Render a simple `div` first and initialize Tiptap on click.

### ELK Layout Node Sizes

- **Problem**: ELK needs exact node dimensions to calculate a good layout, but Vue renders nodes with dynamic sizes.
- **Solution**: Use `ResizeObserver` (via `useNodeSizeObserver`) to measure nodes and feed dimensions back into the layout engine.

## Testing

### Reactive State in Tests

- **Problem**: Vitest tests might check state before Vue has finished updating the DOM.
- **Solution**: Use `await nextTick()` or `vi.waitUntil(() => ...)` to ensure reactivity has settled.

### Shared Mutable State in `describe`

- **Problem**: Defining mutable objects at the `describe` level causes test interference.
- **Solution**: Always use builders inside `it` or `beforeEach` to create fresh data.

## Build & Dependencies

### Large Bundle Size

- **Problem**: Third-party libraries like `elkjs` or `tiptap` significantly increase bundle size.
- **Solution**: Use dynamic imports (`defineAsyncComponent`) to split these into separate chunks.
