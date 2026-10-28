# 10. A move animates with a CSS transition

Status: Proposed, 2026-10-28

## Context

How does a move animate?

- **Motion standard.** A move takes no longer than 400 ms, brings what arrives in by easing out, and every change happens in one step when the writer's system asks for reduced motion ([the motion standard](../standards/motion.md), [quality targets](../architecture.md#quality-targets)).
- **Acting while it runs.** The writer can click, tab or type while a move runs ([the motion standard](../standards/motion.md)), so the control they aim at is where it is drawn and receives the click itself. A view transition hands a click during the transition to the root, not to the element the writer aimed at ([the probe](https://github.com/yearofthedan/working-title/issues/126#issuecomment-6403705386)).
- **What a piece is.** Every piece is one `fieldset`, kept on the page, whose width and position the UI works out ([ADR 9](0009-graph-drawn-in-plain-html-and-css.md)): the elements a move touches are already there, and the UI already knows where each one is going.
- **A style relies on Baseline features only** ([the styles standard](../standards/styles.md)), and CSS interpolates no property to or from `auto`.
- **The browser specs read the graph.** A story's approved files record the tree, and a width or a position is measured in the browser, because the tree does not carry either ([ADR 9](0009-graph-drawn-in-plain-html-and-css.md)). A graph mid-move has no arrangement to read.

## Options considered

| Option | Motion standard | Acting while it runs | What a piece is | Browser specs |
| --- | --- | --- | --- | --- |
| A CSS transition per property, on each piece | The duration and the easing are one declaration, and one media query refuses both under reduced motion | The pieces are the elements the writer acts on, so the click lands on the piece | Fits: the UI writes each piece's width and position already | A measured box is the interpolated one, so a read waits for the move to land |
| The View Transition API | The motion is one call, and its timing is a declaration | A click during the transition lands on the root, not on the piece | Needs a snapshot of each piece, so what is drawn is not the element the writer acts on | The elements land at once, and the motion is on snapshots a box cannot measure |
| A per-piece animation loop in JavaScript | The duration lives in the loop, which branches on reduced motion itself | The pieces are the elements the writer acts on, so the click lands on the piece | Fits | The loop writes every frame, and the boxes it writes are the ones read |

## Decision

A move animates with a CSS transition on each piece's `left`, `top`, `width`, `height`, `opacity` and `visibility`, declared in `src/shell.css` inside `@media (prefers-reduced-motion: no-preference)` and timed by two tokens in `src/tokens.css`.

Acting while it runs decided it: the writer's click has to reach the piece, and the View Transition API hands it to the root instead. What a piece is left the other two options close: ADR 9 chose elements that keep a position, which makes the transition a declaration rather than a mechanism, and which a JavaScript loop only re-does by hand where the stylesheet already does it. The browser specs are the force against the chosen option, and they pay for it: a read of a moving box is a read of the past, so the driver answers with the landed arrangement once the animations finish.

CSS interpolating no property to or from `auto` is why each piece's width and height are written as numbers on every layout pass, and why the UI measures the height a card wants at its new kind before it writes it.

## Consequences

- A piece is placed by its centre, so a card grows and shrinks about its middle.
- The UI measures a card's height on every layout pass and writes two sizes per move: work the layout engine did before.
- A piece leaving the graph fades, and is out of the keyboard's, the pointer's and the accessibility tree's reach from the moment the move starts.
- A resize during a move waits for the move to land and then lays the graph out in one step; at rest it does the same in one step, so nothing moves on its own.
- The timing is checked: [`focus.browser.test.ts`](../../src/ui/focus/focus.browser.test.ts) reads the animations every kind of move runs and refuses one longer than 400 ms, one that does not ease out, and any animation under reduced motion.
- Ruled out: the View Transition API, and any motion owned by JavaScript rather than by the stylesheet.
