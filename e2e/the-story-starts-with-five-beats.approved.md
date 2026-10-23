Rule: a new project's story starts with five beats in order, each keeping the one-sentence summary the writer types after a reload.

### Scenario: a new project starts with five beats

```
Given a new project
When the writer opens the app
Then the writer sees
- main:
  - group "The story":
    - text: The story One-sentence summary
    - textbox "One-sentence summary"
  - list:
    - listitem:
      - group "Beat 1":
        - text: Beat 1 One-sentence summary
        - textbox "One-sentence summary"
    - listitem:
      - group "Beat 2":
        - text: Beat 2 One-sentence summary
        - textbox "One-sentence summary"
    - listitem:
      - group "Beat 3":
        - text: Beat 3 One-sentence summary
        - textbox "One-sentence summary"
    - listitem:
      - group "Beat 4":
        - text: Beat 4 One-sentence summary
        - textbox "One-sentence summary"
    - listitem:
      - group "Beat 5":
        - text: Beat 5 One-sentence summary
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
    - text: The story One-sentence summary
    - textbox "One-sentence summary"
  - list:
    - listitem:
      - group "Beat 1":
        - text: Beat 1 One-sentence summary
        - textbox "One-sentence summary"
    - listitem:
      - group "Beat 2":
        - text: Beat 2 One-sentence summary
        - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
    - listitem:
      - group "Beat 3":
        - text: Beat 3 One-sentence summary
        - textbox "One-sentence summary"
    - listitem:
      - group "Beat 4":
        - text: Beat 4 One-sentence summary
        - textbox "One-sentence summary"
    - listitem:
      - group "Beat 5":
        - text: Beat 5 One-sentence summary
        - textbox "One-sentence summary"
```
