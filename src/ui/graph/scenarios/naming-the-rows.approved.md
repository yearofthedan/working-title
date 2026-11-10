Rule: Each row is named in the method's words.

### Scenario: the rows are named for what they hold

```
Given a current beat with two scenes
Then the writer sees
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
    - group "Beat 2":
      - heading "Beat 2" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
      - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
  - toolbar "Scenes under Beat 2":
    - group "Scene 1":
      - heading "Scene 1" [level=4]:
        - button "Scene 1"
      - text: List line
      - textbox "List line"
      - button "Open beside"
    - group "Scene 2":
      - heading "Scene 2" [level=4]:
        - button "Scene 2"
      - text: List line
      - textbox "List line"
      - button "Open beside"
```
