Rule: What the writer types into a facet's field is what the field holds.

### Scenario: the writer types a sentence

```
Given the story is on screen
When the writer types "A widow hunts the man who sank her husband's ship" into the story's One-sentence summary
Then the writer sees
- main:
  - group "The story":
    - text: The story One-sentence summary
    - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
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

### Scenario: the writer types into one beat

```
Given the story is on screen
When the writer types "Maren finds the ship's log and learns the sinking was no accident" into beat 2's one-sentence summary
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
