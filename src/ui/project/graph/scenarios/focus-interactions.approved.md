Rule: What the writer types into a facet's field is what the field holds.

### Scenario: the writer types a sentence

```
Given the story is on screen
When the writer types "A widow hunts the man who sank her husband's ship" into the story's One-sentence summary
Then the writer sees
- main:
  - toolbar "The story":
    - group "The story" [current]:
      - heading "The story" [level=2]
      - text: One-sentence summary
      - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
      - button "Add a beat"
```

### Scenario: the writer types into one beat

```
Given a project with a beat
When the writer types "Maren finds the ship's log and learns the sinking was no accident" into beat 1's one-sentence summary
Then the writer sees
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
      - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
      - button "Add a scene"
      - button "Open beside"
```
