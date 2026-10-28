# 10. A move animates with a CSS transition

Status: Proposed, 2026-10-28

## Context

How does a move of the focus animate?

- **Acting while it runs.** The writer can click, tab or type while a move runs ([the motion standard](../standards/motion.md)), so what they click has to be the piece itself. A click during a view transition lands on the page's root, not on the element under the pointer ([the probe](https://github.com/yearofthedan/working-title/issues/126#issuecomment-6403705386)).
- **Checked motion.** `./do check` refuses motion that runs too long or runs under reduced motion, by reading the motion the browser lists. The browser lists CSS transitions and Web Animations, each with its timing, and lists nothing for motion a script drives frame by frame ([the probe](https://github.com/yearofthedan/working-title/issues/126#issuecomment-6403705386)).
- **What a piece is.** Every piece is one element, kept on the page, whose size and position the UI works out ([ADR 9](0009-graph-drawn-in-plain-html-and-css.md)), so the elements a move touches are already there.
- **Reading the graph in tests.** Widths and positions are measured in the browser, since the recorded tree carries neither ([ADR 9](0009-graph-drawn-in-plain-html-and-css.md)), and a graph mid-move has no arrangement to measure.

## Options considered

| Option | Acting while it runs | Checked motion | What a piece is | Reading the graph in tests |
| --- | --- | --- | --- | --- |
| A CSS transition on each piece | The click lands on the piece | Listed, with its timing | Fits: the pieces already move | A read waits for the move to land |
| A view transition | The click lands on the root | Listed, with its timing | Needs a snapshot of each piece, drawn in place of the piece | The pieces land at once; the motion is on snapshots |
| A script that moves each piece every frame | The click lands on the piece | Not listed, so nothing checks it | Fits | Each frame's boxes are the ones read |

## Decision

A move animates with a CSS transition on each piece, and reduced motion turns the transition off in the stylesheet.

Acting while it runs ruled out a view transition: the writer's click has to reach the piece. Checked motion ruled out a script that moves each piece: the browser does not list its motion, so the check that refuses motion over 400 ms or under reduced motion could not see it. Reading the graph in tests favours the script; it is outweighed, since a test can wait for a move to land where nothing can check motion the browser does not list.

## Consequences

- The UI works out each piece's size as well as its position on every move, because CSS interpolates to or from an automatic size only with features not yet Baseline ([MDN: `interpolate-size`](https://developer.mozilla.org/en-US/docs/Web/CSS/interpolate-size), [the styles standard](../standards/styles.md)). That is work the layout engine did before.
- A piece leaving the graph fades, and is out of reach of the keyboard and the pointer from the moment the move starts.
- A test that reads the graph waits for the move to land first.
- The motion of every kind of move is checked by [`focus.browser.test.ts`](../../src/ui/focus/focus.browser.test.ts), with the system asking for reduced motion and without.
- Ruled out: the View Transition API, and motion a script drives frame by frame.
