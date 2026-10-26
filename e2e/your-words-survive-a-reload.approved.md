Rule: what the writer types as the story's one-sentence summary is still there after a reload.

### Scenario: the story sentence survives a reload

```
Given a new project
When the writer types "A widow hunts the man who sank her husband's ship" as the story's one-sentence summary
And reloads the app
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]
    - text: One-sentence summary
    - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
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
