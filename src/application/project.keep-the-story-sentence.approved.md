Rule: what the writer types as the story's one-sentence summary is still there after a reload.

### Scenario: the story sentence survives a reload

```
Given a new project
When the writer types "A widow hunts the man who sank her husband's ship" as the story's one-sentence summary
 └ and reloads the app
Then the story's one-sentence summary reads "A widow hunts the man who sank her husband's ship"
```
