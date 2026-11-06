Rule: the writer can add scenes under any beat, each new scene going after that beat's existing scenes and brought into view.

### Scenario: scenes are added under a beat

```
Given a new project
When the writer adds a scene under beat 2
And adds a scene under beat 4
Then the writer sees
- main:
  - toolbar "Beat 4":
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
  - toolbar "Scenes under Beat 4":
    - group "Scene 1":
      - heading "Scene 1" [level=4]
      - text: List line
      - textbox "List line"
      - button "Open beside"
```
