Rule: a new project's story starts with five beats in order, each keeping the one-sentence summary the writer types after a reload.

### Scenario: a new project starts with five beats

```
Given a new project
When the writer opens the app
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 1":
    - heading "Beat 1" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 3":
    - heading "Beat 3" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 4":
    - heading "Beat 4" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 5":
    - heading "Beat 5" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
```

### Scenario: a beat's sentence survives a reload

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
  - group "Beat 1":
    - heading "Beat 1" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
  - group "Beat 3":
    - heading "Beat 3" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 4":
    - heading "Beat 4" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 5":
    - heading "Beat 5" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
```
