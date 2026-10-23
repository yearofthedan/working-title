Rule: what the writer types as the story's one-sentence summary is still there after a reload.

### Scenario: the story sentence survives a reload

```
Given a new project
When the writer types "A widow hunts the man who sank her husband's ship" as the story's one-sentence summary
And reloads the app
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
