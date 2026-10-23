# Markup

**Audience:** anyone writing the DOM a page shows.
**Purpose:** what an element is, and what its name means to the writer hearing it, so a page reads as the thing it shows.

- **The element says what the thing is.** A native element comes first: `label`, `fieldset` and `legend`, a heading, a list, a button. An ARIA role is for what no native element covers ([WAI-ARIA, first rule of ARIA use](https://www.w3.org/TR/using-aria/#rule1)).
- **A named element marks a real semantic boundary**, such as one piece and its facets. A wrapper that exists only for layout carries no role and no name.
- **Markup that is good enough is allowed.** A boundary gets a named element when a story shows it, not ahead of time.
- **Every name in the accessibility tree means something to the writer hearing it**: the method's word or the writer's own text, never a core term or an id, and understandable when reached out of order with its group's name. A reviewer judges this from the tree recorded in the scenario file. What a scenario has to tell apart, the tree tells apart through those names, never through a composed label.
