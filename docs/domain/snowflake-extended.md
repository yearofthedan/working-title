# Snowflake, extended

**Audience:** anyone writing a story, a scenario or a method definition for Snowflake, extended.
**Purpose:** names what the method is agreed to hold. It is data the app reads ([ADR 5](../adr/0005-method-as-data.md)), so [`src/methods/snowflake-extended.ts`](../../src/methods/snowflake-extended.ts) holds the part built so far, and the [ubiquitous language](ubiquitous-language.md) says what a piece, a facet and a stage are.

## Pieces

| Piece | Where it lives | Facets, in order |
| --- | --- | --- |
| Story | Tree root, one per project | One-sentence summary |
| Beat | Tree, five under the story | One-sentence summary, Paragraph, Page |
| Scene | Tree, any number under a beat | List line, Narrative (optional), Prose |
| Character | Cast collection | Summary, Description, Chart |
| Place | Places collection | Description |

## Stages

Ten stages, in the order the writer meets them.

| # | Stage | Kind | Needs |
| --- | --- | --- | --- |
| 1 | Story sentence | Elaborate story | Nothing |
| 2 | Beats | Branch story into beats, starting with five, each seeded with a sentence | The story's one-sentence summary |
| 3 | Beat paragraph | Elaborate beat | Its own one-sentence summary |
| 4 | Beat page | Elaborate beat | Its own paragraph |
| 5 | Scenes | Branch beat into scenes, each with a list line | Its beat's page |
| 6 | Scene narrative | Elaborate scene, optional | Its list line |
| 7 | Scene prose | Elaborate scene | Its list line |
| 8 | Characters | Branch cast into characters, each with a summary | The story's one-sentence summary |
| 9 | Character description, then chart | Elaborate character | The previous facet |
| 10 | Places | Branch places into places, each with a description | Nothing |

A stage's needs suggest the next move and lock nothing ([product principle 4](../product.md#4-the-method-offers-the-writer-decides)).

## Rules

- **Views, not copies.** Snowflake's story paragraph is the five beat sentences read in order, and its four-page synopsis is the beat pages read together. Neither is stored, so nothing drifts.
- **Dependencies are local.** A stage needs a facet on the piece itself or on its parent, never project-wide. Beat 1 can reach scenes and prose while beat 4 is still a sentence.
- **Beats start at five.** Five is Ingermanson's own preference (three disasters plus an ending), so the writer can add or remove beats afterwards. Removing a beat asks first and takes its scenes with it.
- **Scaffold fields are prompts.** The writer can leave any field empty or clear the scaffold. A stage completes on its facet, so a scene with no POV character is fine.
- **POV is a mention.** When filled, it links the scene to a character. Who appears in a scene comes from mentions in its prose.
