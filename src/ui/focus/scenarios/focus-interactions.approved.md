Rule: What the writer types into a facet's field is what the field holds.

### Scenario: the writer types a sentence

```
Given the story is on screen
When the writer types "A widow hunts the man who sank her husband's ship" into the story's One-sentence summary
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]
    - text: One-sentence summary
    - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
  - group "Beat 1":
    - heading "Beat 1" [level=3]:
      - button "Beat 1"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 2":
    - heading "Beat 2" [level=3]:
      - button "Beat 2"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 3":
    - heading "Beat 3" [level=3]:
      - button "Beat 3"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 4":
    - heading "Beat 4" [level=3]:
      - button "Beat 4"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 5":
    - heading "Beat 5" [level=3]:
      - button "Beat 5"
    - text: One-sentence summary
    - textbox "One-sentence summary"
```

### Scenario: the writer types into one beat

```
Given the story is on screen
When the writer types "Maren finds the ship's log and learns the sinking was no accident" into beat 2's one-sentence summary
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]:
      - button "The story"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 1":
    - heading "Beat 1" [level=3]:
      - button "Beat 1"
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
    - button "Add a scene"
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
