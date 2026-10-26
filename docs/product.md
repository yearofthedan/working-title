# Product

**Audience:** anyone writing a story, or making a call no story or epic covers.
**Purpose:** says what working-title is for and who it serves, and gives the principles that decide calls the epics leave open. Terms are in the [ubiquitous language](domain/ubiquitous-language.md).

## What it is

A full, end-to-end writing environment for planners writing long-form narrative, novelists first. A writer should be able to plan, draft and redraft an entire novel here, without switching between apps and scattering the information they need across them.

It is built deliberately for planners, the writers who define structure first and work forward from it, rather than for pantsers. We are excluding pantsers on purpose. The whole design assumes you set something up earlier that guides what you do next, and that assumption only holds if you plan.

Every writer can use it, whatever their sight or whether they use a keyboard, a mouse or a screen reader: it is built to a baseline of accessibility, whose target is in [the architecture](architecture.md#quality-targets).

## The heart

Planning, drafting and replanning form one continuous, cyclical loop: plan a level, drop into a slice and draft it, surface to plan the next slice, draft that, replan upstream as the writing teaches you things. Much of the work is redrafting, so the tool must stay useful deep in the writing, not only at planning time.

The tool's job is to make moving through that loop, in any direction and at any level, effortless, so the writer stays oriented as the story changes. Getting that movement right is the core of the product.

## The visual model

The primary view is a visual graph rather than a flat tree, because a story is a web. Existing tools put characters, chapters, items, themes and timeline in a flat left-hand panel where everything carries equal weight, which captures neither the interrelations of a story nor what the writer needs right now.

Movement between levels of abstraction is first-class. When you're working down at the level of how chapters relate, you can glance up and keep the section's goals, intended character change and key beats in view, so the why stays present while you're deep in the how.

### The graph's layout (working idea)

An idea to build from, not a locked design. A story that settles part of it says so in its criteria.

- **Where a facet is typed.** Short facets, such as a one-sentence summary or a list line, are typed on the piece in the graph. Long facets, such as a paragraph, a page or prose, open in a panel beside the graph, which any piece can open and the writer can close at any time.
- **Cards and chips.** The focus, its parent, its children and the pieces linked to it are cards; every other piece is a chip showing its name. Each level has one card width: story 200 px, beat 180, scene 120, character and place 108. The name takes one line and the sentence two, then they are cut short. Every card is the same height, and a card being typed in grows downward only.
- **Stage word.** A word at a card's bottom right names the stage its piece has reached, such as Sentence, Page, List line or Prose. Whether that stage is done is not shown.
- **Opening the panel.** An icon at a card's top right opens the panel beside. It always shows on a card whose piece has a page or prose, and elsewhere when the pointer is over the card or it has keyboard focus. It is lit while that piece's panel is open.
- **Moving around.** The graph is arranged around the focus: its parent above it, its siblings beside it and its children below. The focus is the one card shown in full; its siblings are chips showing their names, earlier ones to the left and later ones to the right. A piece the writer is not working near is off the graph, and moving the focus is how the writer moves: the graph neither pans nor shrinks to fit. A path beside the page's title names the pieces above the focus, from the story down. The theme runs across the top. The cast and places sit in a band under the tree, which collapses when nothing in it is linked. Next moves are quiet text links in the panel.
- **The pinned panel.** The panel beside the graph is pinned: it holds the piece the writer pinned and stays put while the focus moves.

## North star

Keep the writer focused on the next right thing, guided by what they defined before, so they carry one bite at a time rather than the whole story at once.

The promise is to surface the right few things for where you are right now. It does this by filtering within the current view, guiding you to the next bite through a progressive flow you set up earlier, and keeping the level above in view. This fights overwhelm: you know the next thing to work on and the intent it serves, instead of facing a daunting mess.

## Changes ripple through the web

A change at a higher level has effects across the rest of the novel, so changes ripple through the web. The tool should help the writer see and manage that ripple. This is true at the vision level even though the mechanism that delivers it is a later feature.

## Not designed for yet

- In-tool assessment, such as "is this character behaving as I'd expect?"
- Full ripple mechanics: how upstream changes propagate and are surfaced.
- Short-story specialisation. Short stories may work for free (a single tree or subtree), but we do not design around them; the risk is overfitting to a non-core case.

## Design principles

When a call isn't covered by a story or an epic (issues #2 to #12), name the principle that decided it. When two pull apart, the lower number wins.

### 1. Your words are never lost

Anything the writer has written survives a crash, a closed tab, a lost folder or a mistake. Anything that removes words asks first and leaves a way back.

**Example.** The folder loses permission while the writer is drafting. Their work keeps saving in the browser, a quiet notice offers to reconnect, and the folder catches up once it's back.

**Rules out.** A save that waits on the folder. Any change, such as an import or a method update, that replaces text without keeping a version.

### 2. Stay in the prose

While the writer is drafting, what they need comes to the page. Anything that takes them away brings them back to the same cursor.

**Example.** Adding a note to a passage happens beside the text, with the cursor still in the sentence.

**Rules out.** Dialogs over the prose. Leaving the page to file, name or sort something.

### 3. Show what the focus needs

Each screen shows the piece in focus and what bears on it. Everything else is one step away.

**Example.** Focused on a scene, the writer sees that scene's notes beside it. The novel's other notes stay in the one list.

**Rules out.** Screens that show everything at once. Counts and badges on every piece.

### 4. The method offers, the writer decides

Guidance, scaffolds and next moves suggest. The writer can skip a stage, go out of order or go beyond the method.

**Example.** A writer drafts a scene before its beat has a page. The app lets them, and a next move mentions the page.

**Rules out.** Locked stages, required fields, and "finish this first".

### 5. Instant or not at all

Anything the writer triggers shows its result within a tenth of a second, and typing keeps up within a frame. Work that can't be that fast runs in the background while the writer carries on.

**Example.** Searching the novel shows matches as the writer types.

**Rules out.** A spinner on anything the writer clicked. A feature that can only be slow goes back to design.
