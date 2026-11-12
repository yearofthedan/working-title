# 10. A component builds its own element and the app places it

Status: Proposed, 2026-11-12

## Context

Where does a component's root element come from?

- **A piece's element.** A piece is a named boundary in the accessibility tree, and a wrapper that exists only for layout carries no role and no name ([the markup standard](../standards/markup.md)). A component handed a container draws into the container, which is then its root; one that builds its element is its own root.
- **Moving pieces.** The app decides where each part of the page sits: the header, the graph in `main`, and the panel beside it ([architecture: parts](../architecture.md#parts)). A component's root is the element that moves when a part does.
- **Tests.** A component is tested alone, mounted by its `*.harness.ts` ([the testing standard](../standards/testing.md)). Whatever the app hands a component, its harness has to hand it too.

## Options considered

| Option | A piece's element | Moving pieces | Tests |
| --- | --- | --- | --- |
| A component builds and returns its element, and whoever creates it places it | The element the component builds is the piece's boundary, with nothing between it and the page | The element travels with the component, and the app places it wherever it goes | The harness creates the component and appends its element, as the app does |
| Hand every component a container to fill | The parent's container is the root, so a container built for layout becomes the piece's boundary | The parent picks a container each time, and a component that needs an element of its own cannot go where the parent has none | The harness builds the container the app would hand it, a second copy of the page's shape |

## Decision

A component builds and returns its root element, and whoever creates it places it. Only start-up, `renderApp`, finds elements of the page. A component never looks up, listens on or writes to an element outside its root. It may read global state, such as focus (`document.activeElement`) and the viewport's size (`window.innerHeight`).

A piece's element decided it: the element a component builds is the piece's boundary, so no container built for layout becomes a role the writer hears. Tests decided it too: the harness does what the app does, so what a test mounts cannot drift from what the app mounts. Moving pieces favours it as well, since the element travels with the component.

Handing every component a container to fill loses on all three: the container becomes the piece's boundary, a component that needs an element of its own cannot be placed where the parent has none, and the harness holds a second copy of the page's shape that the app's page can drift from.

## Consequences

- A component's harness creates the component and appends its element, so the app and the harness mount a component the same way, and what a test mounts is what the app mounts.
- The app holds where each component goes. A component is placed without changing it, and its markup is read whole in its own file.
- Ruled out: a component that knows where it is placed, and a parent's container standing in as a piece's boundary.
- What would show the rule is wrong: a parent wrapping a component's element in a host of its own to place it, or a component that needs to know where it is placed to work.
- `./do check` enforces it: a lint over `src/ui/**/*.dom.ts`, with `app.dom.ts` alone excepted, refuses a lookup or a listener outside a component. The third slice of [#208](https://github.com/yearofthedan/working-title/issues/208) adds that lint and sets this record to Accepted.
