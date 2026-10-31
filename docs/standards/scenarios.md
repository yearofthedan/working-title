# Scenarios

**Audience:** anyone wording a story's scenario, before the builder agrees it.
**Purpose:** what each line of a scenario holds, the words it uses, and where it is written.

A scenario is a story's acceptance criteria in the writer's words, agreed one at a time before anything is built ([the writing-stories skill](../../.agents/skills/writing-stories/SKILL.md#show-it-then-file-it)). Its `Rule:` line, its heading, the tree a run records and the run that approves it are [Testing](testing.md#approved-scenarios)'s subject; this page is what the steps between them say.

## What each line holds

- **Given sets up the world in the writer's words, in full sentences.** `Given a beat card is active with tab focus` is everything the steps after it need; `Given a new project`, then `And beat two is active`, describes the app before it says where the writer is in it.
- **Given holds only what the behaviour depends on, and every piece the later steps name.** A scenario about the arrow keys names the row they walk: `Given two beats, the first active with tab focus`, because the second beat is the one `→` reaches.
- **Given states the condition in the writer's terms, never how a test produces it.** `Given a beat has too many scenes to fit on one page (cutting off the first and last scenes)`; not `Given a beat with eight scenes`, which is the number a test happened to use, and not `its first scene is off screen`, which is the outcome the scenario exists to show.
- **When is an action, and Then is an outcome.** `When the writer presses →`, `Then the second beat becomes active`. A further action under the `When` is an `And`, and a further outcome under the `Then` is an `And`: an action is never chained after a `Then`.
- **A Then is a change the writer can tell apart, and that a run can show.** Not `Then the writer hears "Scene 2"`: what a run records is the tree, and what a screen reader says aloud is not in it. Nor a difference only the code has — the stop may be the piece's name button, but the step still reads `Then focus moves to the first scene`.
- **A line about something staying as it was is a `But`,** and only where the writer would expect it to change: after tabbing, `But beat two stays active`, since moving the cursor is what they might take for having moved the piece.
- **No line repeats what another line already shows.**

## The words

- **Every word is one the [ubiquitous language](../domain/ubiquitous-language.md) gives**, and a word its table lists as taken — `node` for a piece, `stage` for a level — is not used.
- **The browser's vocabulary is not used**: the place Tab sits is never `the cursor`, and a step names what the writer is working with, in the method's words.
- **A key is the only thing capitalised**: `Tab`, `Shift+Tab`, `Enter`, `Esc`, `←`, `→`, `↑`, `↓`. Everything else is lowercase — `beat two`, `one-sentence summary` — except a name the writer reads on screen, quoted as it reads: `Then focus moves to "Add a scene"`.

## Which file it goes in

- **A scenario is written under the behaviour it describes, not under the module its code sits in today.** The module may move; the scenario stays with the behaviour and changes only when the behaviour does. Where that file is, and how it is kept, is [Testing](testing.md#approved-scenarios)'s.
