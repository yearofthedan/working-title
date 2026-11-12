# 10. A component builds its own element and the app places it

Status: Proposed, 2026-11-12

## Context

Where does a component's root element come from?

- **A piece's element.** A piece is a named boundary in the accessibility tree, and its element says what it is ([the markup standard](../standards/markup.md)). A component handed a container draws into an element it did not choose, which is then its root; one that builds its element chooses its own tag and role.
- **Moving pieces.** The app decides where each part of the page sits: the header, the graph in `main`, and the panel beside it ([architecture: parts](../architecture.md#parts)). A component's root is the element that moves when a part does.
- **Tests.** A component is tested alone, mounted by its `*.harness.ts` ([the testing standard](../standards/testing.md)). Whatever the app does to put a component on the page, its harness has to do too.

## Options considered

| Option | A piece's element | Moving pieces | Tests |
| --- | --- | --- | --- |
| A component builds and returns its element, and whoever creates it places it | The component chooses its own tag and role, so its boundary is the same wherever it goes | The element travels with the component, and the app places it wherever it goes | The harness creates the component and appends its element, as the app does |
| Hand every component a container to fill | The parent chooses the root's tag and role, so a component cannot guarantee its own boundary | The parent picks a container each time, and a component that needs an element of its own cannot go where the parent has none | The harness builds the container the app would hand the component, as well as the component |

## Decision

A component builds and returns its root element, and whoever creates it places it. Only start-up, `renderApp`, finds elements of the page. A component never looks up, listens on or writes to an element outside its root. It may read global state, such as focus (`document.activeElement`) and the viewport's size (`window.innerHeight`).

A piece's element decided it: the element a component builds carries the tag and role the component chose, so no parent can change what the writer hears. Tests decided it too: the harness does what the app does with the component, which is to create it and append its element. Moving pieces favours it as well, since the element travels with the component.

Handing every component a container to fill loses on all three: the parent chooses the root's tag and role, a component that needs an element of its own cannot be placed where the parent has none, and the harness has to build the container as well.

## Consequences

- A component's harness creates the component and appends its element, so the app and the harness mount a component the same way.
- The app holds where each component goes. A component is placed without changing it, and its markup is read whole in its own file.
- Ruled out: a component that knows where it is placed, and a parent choosing a component's root element.
- What would show the rule is wrong: a parent wrapping a component's element in a host of its own to place it, or a component that needs to know where it is placed to work.
