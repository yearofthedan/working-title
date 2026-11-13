# 10. A component builds its own element and the app places it

Status: Proposed, 2026-11-12

## Context

Where does a component's root element come from?

- **A piece's element.** A piece is a named boundary in the accessibility tree, and its element says what it is ([the markup standard](../standards/markup.md)). A component handed a container draws into an element it did not choose, which is then its root; one that builds its element chooses its own tag and role.
- **Moving pieces.** The app decides where each part of the page sits: the header, the graph in `main`, and the panel beside it ([architecture: UI](../architecture.md#ui)). A component's root is the element that moves when a part does.
- **Tests.** A component is tested alone, mounted by its `*.harness.ts` ([the testing standard](../standards/testing.md)). Whatever container a component takes from its parent, its harness has to supply, and keep in step with the one the app supplies.

## Options considered

| Option | A piece's element | Moving pieces | Tests |
| --- | --- | --- | --- |
| A component builds and returns its element, and whoever creates it places it | The component chooses its own tag and role | The element travels with the component, and the app places it wherever it goes | The component takes no container from its parent, so the harness supplies only a place to append its element |
| Hand every component a container to fill | The parent chooses the root's tag and role | The parent picks a container each time, and a component that needs an element of its own cannot go where the parent has none | The component takes its container from its parent, so each harness builds the container the app would hand it, and a change to that container is made in each |

## Decision

A component builds and returns its root element, and whoever creates it places it. Only start-up, `renderApp`, finds elements of the page. A component never looks up, listens on or writes to an element outside its root. It may read global state, such as focus (`document.activeElement`) and the viewport's size (`window.innerHeight`).

A piece's element decided it: the element a component builds carries the tag and role the component chose. Tests decided it too: a component that takes no container from its parent has a harness that supplies only a place to append it. Moving pieces favours it as well, since the element travels with the component.

Handing every component a container to fill loses on all three: the parent chooses the root's tag and role, a component that needs an element of its own cannot be placed where the parent has none, and each harness has to build and keep in step a container the app hands it.

## Consequences

- A component's harness creates the component and appends its element, so the app and the harness mount a component the same way.
- The app holds where each component goes. A component is placed without changing it, and its markup is read whole in its own file.
- A component that measures itself can do so only once its element is attached to the document and its parent gives it a size, so whoever creates it places it first and then asks it to draw, and its harness does the same. That is a second step to remember. The graph also needs a sized, positioned `main` around it, because its styles are scoped to `main` in `src/shell.css`.
- Ruled out: a component that knows where it is placed, and a parent choosing a component's root element.
- What would show the rule is wrong: a parent wrapping a component's element in a host of its own to place it, or a component that needs to know where it is placed to work.
- No check enforces the rule.
