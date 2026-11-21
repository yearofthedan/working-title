Rule: the writer opens a beat or a scene in the panel beside the graph and types its facets there. The panel keeps that piece until the writer closes it or opens another, even while the focus moves, and the one-sentence summary reads the same on the card and in the panel.

### Scenario: a beat opens with its paragraph and its page

```
Given a project with a beat
When the writer opens beat 1 beside the graph
Then beat 1 is open beside the graph, with its paragraph and then its page
- complementary "Beat 1":
  - heading "Beat 1" [level=2]
  - button "Close"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - text: Paragraph
  - textbox "Paragraph"
  - text: Page
  - textbox "Page"
```

### Scenario: the one-sentence summary is typed beside the graph

```
Given beat 1 is open beside the graph
When the writer types "Maren learns the sinking was no accident" as beat 1's one-sentence summary beside the graph
Then beat 1's one-sentence summary on its card reads "Maren learns the sinking was no accident"
- main:
  - toolbar "Beats under The story":
    - group "Beat 1" [current]:
      - textbox "One-sentence summary": Maren learns the sinking was no accident
```

### Scenario: the one-sentence summary is typed on its card while the panel is open

```
Given beat 1 is open beside the graph
When the writer types "Maren learns the sinking was no accident" as beat 1's one-sentence summary
Then beat 1's one-sentence summary beside the graph reads "Maren learns the sinking was no accident"
- complementary "Beat 1":
  - textbox "One-sentence summary": Maren learns the sinking was no accident
```

### Scenario: the panel keeps its beat while the focus moves

```
Given a project with two beats, beat 1 is open beside the graph
When the writer clicks beat 1
And presses →
Then beat 2 is in focus
- main:
  - toolbar "Beats under The story":
    - group "Beat 2" [active] [current]:
      - heading "Beat 2" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
      - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And beat 1 is still open beside the graph
- complementary "Beat 1":
  - heading "Beat 1" [level=2]
  - button "Close"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - text: Paragraph
  - textbox "Paragraph"
  - text: Page
  - textbox "Page"
```

### Scenario: opening another beat replaces the one beside

```
Given a project with two beats, beat 1 is open beside the graph
When the writer opens beat 2 beside the graph
Then beat 2's paragraph is open beside the graph
- complementary "Beat 2":
  - heading "Beat 2" [level=2]
  - button "Close"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - text: Paragraph
  - textbox "Paragraph"
  - text: Page
  - textbox "Page"
```

### Scenario: closing the panel

```
Given beat 1 is open beside the graph
When the writer closes the panel
Then nothing is open beside the graph
- banner:
  - heading "Untitled project" [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 1
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1" [current]:
      - heading "Beat 1" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
```

### Scenario: Esc closes the panel

```
Given beat 1 is open beside the graph
When the writer presses Esc
Then nothing is open beside the graph
- banner:
  - heading "Untitled project" [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 1
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1" [current]:
      - heading "Beat 1" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
```

### Scenario: a scene opens with its narrative and its prose

```
Given a project with two scenes under beat 1
When the writer clicks beat 1
And presses ↓
And opens scene 1 under beat 1 beside the graph
Then scene 1 under beat 1 is open beside the graph, with its narrative and then its prose
- complementary "Scene 1":
  - heading "Scene 1" [level=2]
  - button "Close"
  - text: List line
  - textbox "List line"
  - text: Narrative
  - textbox "Narrative"
  - text: Prose
  - textbox "Prose"
```
