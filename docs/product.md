# Product

**Audience:** anyone writing a story, or making a call no story or epic covers.
**Purpose:** says what working-title is for and who it serves, and gives the principles that decide calls the epics leave open. Terms are in the [ubiquitous language](ubiquitous-language.md).

## What it is

A full, end-to-end writing environment for planners writing long-form narrative, novelists first. A writer should be able to plan, draft and redraft an entire novel here, without switching between apps and scattering the information they need across them.

It is built deliberately for planners, the writers who define structure first and work forward from it, rather than for pantsers. We are excluding pantsers on purpose. The whole design assumes you set something up earlier that guides what you do next, and that assumption only holds if you plan.

## The heart

Planning, drafting and replanning form one continuous, cyclical loop: plan a level, drop into a slice and draft it, surface to plan the next slice, draft that, replan upstream as the writing teaches you things. Much of the work is redrafting, so the tool must stay useful deep in the writing, not only at planning time.

The tool's job is to make moving through that loop, in any direction and at any level, effortless, so the writer stays oriented as the story changes. Getting that movement right is the core of the product.

## The visual model

The primary view is a visual graph rather than a flat tree, because a story is a web. Existing tools put characters, chapters, items, themes and timeline in a flat left-hand panel where everything carries equal weight, which captures neither the interrelations of a story nor what the writer needs right now.

Movement between levels of abstraction is first-class. When you're working down at the level of how chapters relate, you can glance up and keep the section's goals, intended character change and key beats in view, so the why stays present while you're deep in the how.

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
