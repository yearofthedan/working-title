Rule: the graph shows the story with its beats under it in order, and each piece's one-sentence summary is typed on the piece itself.

### Scenario: a new project shows on the graph

```
Given a new project
When the writer opens the app
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - list:
      - listitem:
        - group "Beat 1":
          - heading "Beat 1" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
      - listitem:
        - group "Beat 2":
          - heading "Beat 2" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
      - listitem:
        - group "Beat 3":
          - heading "Beat 3" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
      - listitem:
        - group "Beat 4":
          - heading "Beat 4" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
      - listitem:
        - group "Beat 5":
          - heading "Beat 5" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
```

### Scenario: a sentence typed on a beat shows on the graph after a reload

```
Given a new project
When the writer types "Maren finds the ship's log and learns the sinking was no accident" as beat 2's one-sentence summary
And reloads the app
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - list:
      - listitem:
        - group "Beat 1":
          - heading "Beat 1" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
      - listitem:
        - group "Beat 2":
          - heading "Beat 2" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
      - listitem:
        - group "Beat 3":
          - heading "Beat 3" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
      - listitem:
        - group "Beat 4":
          - heading "Beat 4" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
      - listitem:
        - group "Beat 5":
          - heading "Beat 5" [level=3]
          - text: One-sentence summary
          - textbox "One-sentence summary"
```
