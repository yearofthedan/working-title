Rule: What the writer types into a facet's field is what the field holds.

### Scenario: the writer types a sentence

```
Given the story is on screen
When the writer types "A widow hunts the man who sank her husband's ship" into One-sentence summary
Then the writer sees
- main:
  - text: One-sentence summary
  - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
```
