# ADR 002: Data Flow Boundaries

## Status

Accepted

## Context

Applications need to transform data between different layers with distinct concerns:

- **Storage** optimizes for persistence: serialization format, schema versioning, query efficiency
- **Configuration** (templates) optimizes for declarative structure and validation rules
- **Views** optimize for specific UI needs: filtered subsets, enriched metadata, layout organization

When storage or configuration shapes leak directly into view components, several problems emerge:

1. **Views become coupled to persistence details** they shouldn't know about
2. **Transformation logic gets duplicated** across multiple components
3. **Changes to storage structure** ripple through all consuming views
4. **Testing becomes harder** - components require full storage/config setup

In this application, views need different data than what's persisted:

- Canvas needs only `visibility: 'canvas'` steps, enriched with layout tracks and UI actions
- Sidebar needs only `visibility: 'sidebar'` steps with editing metadata
- Both need step definitions merged with step content, which are stored separately

## Decision

We will maintain clear boundaries between external data sources and view concerns using an **adaptation layer** implemented through Vue composables.

**Core Principle**: External data shapes (storage, configuration, future APIs) must not leak into view components. A boundary layer transforms external shapes into models tailored for specific view needs.

## Implementation (Vue-specific)

1. **Provide/Inject Pattern**: External data (storage, configuration) is provided at the top level via `provide()`. Child components never directly access or import these external types.

2. **Composable Abstractions**: Components access data only through composables that return view-appropriate interfaces:
   - `useProjectContent()` - Content access and mutation
   - `useProjectMutations()` - Domain mutations (addStep, addConnection)
   - `useCanvasViewModel()` - Canvas-specific transformations
   - `useSidebarViewModel()` - Sidebar-specific transformations

3. **Folder Structure**: Features separate concerns into three layers:
   - `storage/` - Persistence layer (Schema definitions, operations, migrations)
   - `domain/` - Application logic and anti-corruption layer (State management, context providers, domain operations)
   - `[view]/composables/` - View-specific transformations (Filtering + enrichment)

4. **No Domain Model Layer**: For client-only Vue apps, storage and domain models can be the same. The provide/inject + composables pattern IS the anti-corruption layer. Add a separate domain layer only if you have genuinely different shapes (e.g., backend API responses).

## Data Flow

```
Storage (ProjectData) ──┐
                        ├──> Adaptation Layer ──> View Components
Template (Config)    ───┘     (Composables)        (Focused on rendering)
```

The adaptation layer prevents:

- Views from knowing about storage structure
- Transformation logic duplication
- Storage changes breaking view implementations

## Consequences

**Pros**:

- Views stay focused on rendering, not data transformation
- External contract changes are isolated to adaptation layer
- Multiple views can share transformation logic without duplication
- Easier testing: mock adapted models in view tests, unit test adapters separately
- Clear separation between storage/configuration concerns and UI concerns

**Cons**:

- Additional layer of abstraction (but lightweight - just composables)
- Need to keep adapters synchronized when external or view requirements change
- Initial overhead when adding new data sources

## Future Considerations

As storage strategies evolve, this boundary becomes even more critical:

- **Chunked Storage**: If large projects require splitting into multiple JSON files, the adaptation layer handles loading orchestration without view changes
- **Lazy Loading**: If content is loaded on-demand, the boundary manages loading states and cache without views knowing
- **Backend APIs**: If a backend is introduced, the boundary adapts API responses to view models

## Related

- [ADR-001 Feature Isolation](adr-001-feature-isolation.md) - Prevents features from depending on each other
- [ADR-004 Process Template Pattern](adr-004-process-template.md) - Templates are external configuration adapted by this layer
- [Domain Implementation](../../docs/domain-implementation.md) - Current view transformation implementations
