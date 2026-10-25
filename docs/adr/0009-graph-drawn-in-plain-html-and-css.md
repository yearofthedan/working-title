# 9. Graph drawn in plain HTML and CSS

Status: Accepted, 2026-10-25

## Context

How is the graph drawn?

- **Movement.** A focus or level change takes under 100 ms and every keystroke renders within one frame, at a design size of about 300 pieces and 2,000 links ([architecture](../architecture.md#quality-targets)). Each option was measured on 300 pieces — one story, five beats and 294 scenes — every piece a fixed-size box joined to its parent, with no links across the tree, drawn and redrawn with nothing measured, in headless Chromium, median of 7 runs ([the run](https://github.com/yearofthedan/working-title/issues/100#issuecomment-6386376231)). The keystroke times move by about 8 ms between runs, so they show only that every option is under one frame.
- **Accessibility tree.** A piece is a named boundary, and a wrapper that exists only for layout carries no role and no name ([the markup standard](../standards/markup.md)). A story's approved files record the tree ([ADR 8](0008-story-scenarios-run-from-their-approved-files.md)), so what the graph adds to it is read in a diff.
- **Bundle and dependencies.** The app is static files from one build, which the service worker caches whole on the first load, and it is usable within 2 s ([architecture: parts](../architecture.md#parts), [quality targets](../architecture.md#quality-targets)). A graph library brings its own bundle and its own release schedule into that.
- **Room for later needs.** Scenes under a beat, links across the tree, and panning once the graph outgrows the screen are later stories of the epic ([#2](https://github.com/yearofthedan/working-title/issues/2)).

## Options considered

| Option | Movement | Accessibility tree | Bundle and dependencies | Room for later needs |
| --- | --- | --- | --- | --- |
| Nested HTML, laid out by CSS, the joins as pseudo-elements | 26.9 ms first draw, 18.7 ms focus change, 14.2 ms keystroke | A group per piece, and nothing between it and the writer | About 1 KiB, nothing to install | A piece's children are its children in the markup, in order, so a beat's scenes arrive as markup. Panning and links across the tree need coordinates it does not keep |
| Absolute-positioned HTML with SVG lines | 22.7 ms, 9.9 ms, 11.4 ms — the fastest of the three | A group per piece, with the joins in a drawing layer of their own | About 1 KiB, nothing to install | A position per piece, computed and kept from the first story: the coordinates panning and links across the tree need |
| React Flow | 48.4 ms, 19.5 ms, 7.6 ms | Wraps the graph in an `application` role, and gives every piece an unnamed `group` | 389 KiB, a framework and its release schedule | Panning, zoom and edge routing are built in |

## Decision

The graph is nested HTML laid out by CSS. A piece is a `fieldset` holding its facets and, under them, the list of its children; each card is a box in a flex row, and the joins are pseudo-elements of that list. No framework and no layout library draw any of it.

The accessibility tree decided it. React Flow wraps the graph in an `application` role and gives every piece an unnamed `group`, both against the markup standard, so it lost whatever it gains elsewhere. The movement target separates neither of the plain-HTML options: both are far inside 100 ms at the design size. Room for later needs then chose between them. The positioned option leads on panning and links across the tree, which need coordinates; the nested option leads on the next need, a beat's scenes, which arrive as markup with no positions to keep in step. The nested option won because panning and links across the tree are later stories, and moving to positions then keeps the markup and changes only the layout, where taking the positioned option now computes and keeps a position for every piece from this story on.

## Consequences

- A level of the graph is markup and CSS: the beats of this story and the scenes of a later one arrive the same way.
- Nothing computes a position, so no layout pass is kept in step with the tree. Panning and links across the tree are where CSS layout stops giving the graph what it needs; the positioned option supersedes this record there.
- The joins are pseudo-elements: they hold no text and no role, so they are never in the tree a scenario records, and nothing finds them by name.
- The graph's shape is checked: a piece that moves, renames or loses its group is refused by `./do check` until its approved file is re-approved. The widths, the joins and the sideways scroll are not checked, and a screenshot in the pull request is their evidence.
- Ruled out: a framework or layout library for the graph, and its bundle on the first load.
