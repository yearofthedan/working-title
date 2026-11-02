Rule: Enter on a piece in another row makes it current.

### Scenario: Enter on a scene makes it current

```
Given a current beat with two scenes
And the first scene has focus
When the writer presses Enter
Then the first scene becomes current
And it has focus
- main:
  - toolbar "Beat 2":
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
  - toolbar "Scenes under Beat 2":
    - group "Scene 1" [active]:
      - heading "Scene 1" [level=4]
      - text: List line
      - textbox "List line"
      - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
    - group "Scene 2":
      - heading "Scene 2" [level=4]:
        - button "Scene 2"
```
