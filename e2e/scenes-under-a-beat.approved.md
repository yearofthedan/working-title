Rule: the writer can add scenes under any beat, each new scene going after that beat's existing scenes and brought into view.

### Scenario: scenes are added under a beat

```
Given a project with two beats
When the writer adds a scene under beat 1
And adds a scene under beat 2
Then the writer sees
- main:
  - toolbar "Beat 2":
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
  - toolbar "Scenes under Beat 2":
    - group "Scene 1" [current]:
      - heading "Scene 1" [level=4]
      - text: List line
      - textbox "List line"
      - button "Open beside"
```
