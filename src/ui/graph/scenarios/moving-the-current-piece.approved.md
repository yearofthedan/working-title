Rule: the writer moves the current piece by clicking a piece's card or with the arrow keys (↑ to its parent, ↓ to a child, ← and → to the previous or next piece in the row, which becomes current with focus on its card), and the graph is arranged around the current piece: its parent above, its siblings beside it and its children below.

### Scenario: a new project opens with the story current

```
Given a new project
When the writer opens the app
Then the story is current, with beats 1 to 5 under it
- group "The story":
  - heading "The story" [level=2]
  - text: One-sentence summary
  - textbox "One-sentence summary"
- group "Beat 1":
  - heading "Beat 1" [level=3]:
    - button "Beat 1"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Open beside"
- group "Beat 2":
  - heading "Beat 2" [level=3]:
    - button "Beat 2"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Open beside"
- group "Beat 3":
  - heading "Beat 3" [level=3]:
    - button "Beat 3"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Open beside"
- group "Beat 4":
  - heading "Beat 4" [level=3]:
    - button "Beat 4"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Open beside"
- group "Beat 5":
  - heading "Beat 5" [level=3]:
    - button "Beat 5"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Open beside"
And the writer sees
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]
      - text: One-sentence summary
      - textbox "One-sentence summary"
  - toolbar "Beats under The story":
    - group "Beat 1":
      - heading "Beat 1" [level=3]:
        - button "Beat 1"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
```

### Scenario: clicking a scene's card makes it current

```
Given a current beat with two scenes
When the writer clicks the first scene's card
Then the first scene becomes current
- group "Scene 1":
  - heading "Scene 1" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And it has focus
- group "Scene 1" [active]:
  - heading "Scene 1" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
```

### Scenario: → makes the next beat current

```
Given two beats, the first current with tab focus
When the writer presses →
Then the second beat becomes current
- group "Beat 2":
  - heading "Beat 2" [level=3]
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Add a scene"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And focus moves to its card
- group "Beat 2" [active]:
  - heading "Beat 2" [level=3]
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Add a scene"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And the first beat is no longer current
- group "Beat 1":
  - heading "Beat 1" [level=3]:
    - button "Beat 1"
```

### Scenario: → in the scenes' row makes the next scene current

```
Given a beat with two scenes, the beat current
And focus on its first scene
When the writer presses →
Then the second scene becomes current
- group "Scene 2":
  - heading "Scene 2" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And focus moves to its card
- group "Scene 2" [active]:
  - heading "Scene 2" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
```

### Scenario: stepping down to a scene

```
Given a project with two scenes under beat 2
When the writer clicks beat 2
And presses ↓
Then scene 1 under beat 2 is current, with beat 2 above it and scene 2 beside it
- group "Beat 2":
  - heading "Beat 2" [level=3]:
    - button "Beat 2"
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Open beside"
- group "Scene 1":
  - heading "Scene 1" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
- group "Scene 2":
  - heading "Scene 2" [level=4]:
    - button "Scene 2"
```

### Scenario: stepping back up to the beat

```
Given a project with two scenes under beat 2
When the writer clicks beat 2
And presses ↓
And presses ↑
Then beat 2 is current, with scenes 1 and 2 under it
- group "Beat 2":
  - heading "Beat 2" [level=3]
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Add a scene"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
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
And focus moves to its card
- group "Beat 2" [active]:
  - heading "Beat 2" [level=3]
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - button "Add a scene"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And the writer sees
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

### Scenario: stepping down returns to the scene the writer left

```
Given a project with two scenes under beat 2
When the writer clicks beat 2
And presses ↓
And presses →
And presses ↑
And presses ↓
Then scene 2 under beat 2 is current
- group "Scene 2":
  - heading "Scene 2" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And focus moves to its card
- group "Scene 2" [active]:
  - heading "Scene 2" [level=4]
  - text: List line
  - textbox "List line"
  - button "Open beside"
  - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
And the writer sees
- main:
  - toolbar "Beat 2":
    - group "Beat 2":
      - heading "Beat 2" [level=3]:
        - button "Beat 2"
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Open beside"
  - toolbar "Scenes under Beat 2":
    - group "Scene 1":
      - heading "Scene 1" [level=4]:
        - button "Scene 1"
    - group "Scene 2":
      - heading "Scene 2" [level=4]
      - text: List line
      - textbox "List line"
      - button "Open beside"
      - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
```
