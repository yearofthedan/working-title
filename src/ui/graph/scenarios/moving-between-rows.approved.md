Rule: Each row of the graph is one Tab stop, named in the method's words, Tab moves the cursor to the next or previous row's first piece and never changes the focus, the arrow keys make the next or previous piece in the row the focus, and a row whose first piece is off screen slides it into view.

### Scenario: moving along a row and into it

```
Given a project with two scenes under beat 2
When the writer clicks beat 2
And presses Tab
Then beat 2 is in focus, with scenes 1 and 2 under it
And presses →
And presses ←
And presses Enter
Then scene 1 under beat 2 is in focus, with beat 2 above it and scene 2 beside it
Then the writer sees
- main:
  - toolbar "Beat 2":
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Scenes under Beat 2":
    - group "Scene 1":
      - heading "Scene 1" [level=4]
      - text: List line
      - textbox "List line"
    - group "Scene 2":
      - heading "Scene 2" [level=4]:
        - button "Scene 2"
```
