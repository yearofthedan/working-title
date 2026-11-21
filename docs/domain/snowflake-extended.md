# Snowflake, extended

**Audience:** anyone writing a story, a scenario or a method definition for Snowflake, extended.
**Purpose:** names what the method is agreed to hold. It is data the app reads ([ADR 5](../adr/0005-method-as-data.md)), so [`src/methods/snowflake-extended.ts`](../../src/methods/snowflake-extended.ts) and [`src/domain/project.ts`](../../src/domain/project.ts) hold the part built so far, and the [ubiquitous language](ubiquitous-language.md) says what a piece, a facet and a stage are.

## Pieces

| Piece | Where it lives | Facets, in order | Built |
| --- | --- | --- | --- |
| Story | Tree root, one per project | One-sentence summary, One-paragraph summary | The sentence only |
| Beat | Tree, under the story | One-sentence summary, Paragraph, Page, Scene list | All but the scene list |
| Scene | Tree, under a beat | List line, Narrative (optional), Prose | Yes |
| Character | Outside the tree | Summary, Description, Chart | No |
| Place | Outside the tree | Description | No |
| Theme | Outside the tree (epic [#5](https://github.com/yearofthedan/working-title/issues/5)) | Description | No |

## Tags

The story offers its beats five tags, in the order the writer meets them. Each carries guidance, which epic [#4](https://github.com/yearofthedan/working-title/issues/4) settles.

| Tag | Built |
| --- | --- |
| Setup | No |
| Disaster 1 | No |
| Disaster 2 | No |
| Disaster 3 | No |
| Ending | No |

## Stages

The method's flow is thirteen stages, in the order the writer meets them.

| # | Stage | Kind | Needs | Built |
| --- | --- | --- | --- | --- |
| 1 | Story sentence | Elaborate the story | Nothing | No |
| 2 | Story paragraph | Elaborate the story | The story's one-sentence summary | No |
| 3 | Beats | Branch the story's paragraph | The story's paragraph | No |
| 4 | Beat paragraph | Elaborate the beat | Its own one-sentence summary | No |
| 5 | Beat page | Elaborate the beat | Its own paragraph | No |
| 6 | Scene list | Elaborate the beat | Its own page | No |
| 7 | Scenes | Branch the beat's scene list | Its own scene list | No |
| 8 | Scene narrative | Elaborate the scene, optional | Its own list line | No |
| 9 | Scene prose | Elaborate the scene | Its own list line | No |
| 10 | Characters | Add characters | The story's one-sentence summary | No |
| 11 | Character description, then chart | Elaborate the character | The previous facet | No |
| 12 | Places | Add places | Nothing | No |
| 13 | Themes | Add themes | Nothing | No |

No stage is built: the method definition has no stages or needs, every facet can be filled at any time, and "Add a beat" or "Add a scene" adds an empty child rather than splitting a facet.

A stage's needs suggest the next move and lock nothing ([product principle 4](../product.md#4-the-method-offers-the-writer-decides)).

In Snowflake, as [Ingermanson sets it out](https://www.advancedfictionwriting.com/articles/snowflake-method), the story's one-sentence summary is expanded into a one-paragraph summary of about five sentences. Here the writer writes that paragraph, then splits it into beats, each tagged Setup, a disaster or Ending as the writer chooses. Once every sentence is split, the paragraph is made entirely of the beats' sentences, while the one-sentence summary stays the story's own.

## Rules

- **Views, not copies.** Once split, the story's paragraph is made of the beats' sentences, and a beat's scene list is made of its scenes' list lines ([model statements 19–23](model.md#branching-splitting-a-facet-into-children)). The four-page synopsis is still the beat pages read together, not stored, so nothing drifts.
- **Needs are local.** A stage needs a facet on the piece itself or on its parent, never project-wide. Beat 1 can reach scenes and prose while beat 4 is still a sentence.
- **Beats start at five.** Ingermanson's five sentences — the setup, three disasters and the ending — are the five tags the story offers, and a project starts with the story alone. Removing a beat asks first and takes its scenes with it.
- **Scaffold fields are prompts.** The writer can leave any field empty or clear the scaffold. A stage completes on its facet, so a scene with no POV character is fine.
- **POV is a mention.** When filled, it links the scene to a character. Who appears in a scene comes from mentions in its prose.
