Rule: Enter on a piece in another row makes it current.

### Scenario: Enter on a scene makes it current

```
Given a current beat with two scenes
And the first scene has focus
When the writer presses Enter
Then the first scene becomes current
And it has focus
- group "Scene 1" [active]:
  - heading "Scene 1" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
```
