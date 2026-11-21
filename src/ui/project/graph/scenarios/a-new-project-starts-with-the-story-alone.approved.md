Rule: a new project starts with the story alone, and the story offers to add a beat.

### Scenario: a new project starts with the story alone

```
Given a new project
When the writer opens the app
Then the writer sees the story, with its one-sentence summary and a button to add a beat, and no beats
- main:
  - toolbar "The story":
    - group "The story" [current]:
      - heading "The story" [level=2]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a beat"
```

### Scenario: the writer adds a beat under the story

```
Given a new project
When the writer adds a beat under the story
Then a beat appears under the story, with its one-sentence summary
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
