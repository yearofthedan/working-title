Rule: the writer opens a beat or a scene in the panel beside the graph and types its facets there. The panel keeps that piece until the writer closes it or opens another, even while the focus moves, and the one-sentence summary reads the same on the card and in the panel.

### Scenario: a beat opens with its paragraph and its page

```
Given a new project
When the writer opens beat 2 beside the graph
Then beat 2 is open beside the graph, with its paragraph and then its page
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 2
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside" [pressed]
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
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

### Scenario: the one-sentence summary is typed beside the graph

```
Given beat 2 is open beside the graph
When the writer types "Maren learns the sinking was no accident" as beat 2's one-sentence summary beside the graph
Then beat 2's one-sentence summary on its card reads "Maren learns the sinking was no accident"
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 2
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary": Maren learns the sinking was no accident
      - button "Add a scene"
      - button "Open beside" [pressed]
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
- complementary "Beat 2":
  - heading "Beat 2" [level=2]
  - button "Close"
  - text: One-sentence summary
  - textbox "One-sentence summary": Maren learns the sinking was no accident
  - text: Paragraph
  - textbox "Paragraph"
  - text: Page
  - textbox "Page"
```

### Scenario: the one-sentence summary is typed on its card while the panel is open

```
Given beat 2 is open beside the graph
When the writer types "Maren learns the sinking was no accident" as beat 2's one-sentence summary
Then beat 2's one-sentence summary beside the graph reads "Maren learns the sinking was no accident"
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 2
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary": Maren learns the sinking was no accident
      - button "Add a scene"
      - button "Open beside" [pressed]
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
- complementary "Beat 2":
  - heading "Beat 2" [level=2]
  - button "Close"
  - text: One-sentence summary
  - textbox "One-sentence summary": Maren learns the sinking was no accident
  - text: Paragraph
  - textbox "Paragraph"
  - text: Page
  - textbox "Page"
```

### Scenario: the panel keeps its beat while the focus moves

```
Given beat 2 is open beside the graph
When the writer clicks beat 2
And presses →
Then beat 3 is in focus
And beat 2 is still open beside the graph
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 3
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
    - group "Beat 3" [active]:
      - heading "Beat 3" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
      - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
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

### Scenario: opening another beat replaces the one beside

```
Given beat 2 is open beside the graph
When the writer opens beat 4 beside the graph
Then beat 4's paragraph is open beside the graph
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 4
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
    - group "Beat 4":
      - heading "Beat 4" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside" [pressed]
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
- complementary "Beat 4":
  - heading "Beat 4" [level=2]
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
Given beat 2 is open beside the graph
When the writer closes the panel
Then nothing is open beside the graph
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 2
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
```

### Scenario: Esc closes the panel

```
Given beat 2 is open beside the graph
When the writer presses Esc
Then nothing is open beside the graph
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: ›" / "Beat 2
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
```

### Scenario: a scene opens beside the graph

```
Given a project with two scenes under beat 2
When the writer clicks beat 2
And presses ↓
And opens scene 1 under beat 2 beside the graph
Then scene 1 under beat 2 is open beside the graph
- banner:
  - heading [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem:
        - text: ›" / "
        - button "Beat 2"
      - listitem: ›" / "Scene 1
- main:
  - toolbar "Beat 2":
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
  - toolbar "Scenes under Beat 2":
    - group "Scene 1":
      - heading "Scene 1" [level=4]
      - text: List line
      - textbox "List line"
      - button "Open beside" [pressed]
    - group "Scene 2":
      - heading "Scene 2" [level=4]:
        - button "Scene 2"
- complementary "Scene 1":
  - heading "Scene 1" [level=2]
  - button "Close"
  - text: List line
  - textbox "List line"
  - text: Narrative
  - textbox "Narrative"
```
