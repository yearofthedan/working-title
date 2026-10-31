Rule: the writer moves the focus by clicking a piece or with the arrow keys (↑ to its parent, ↓ to a child, ← and → to its siblings), and the graph is arranged around the focus: its parent above, its siblings beside it and its children below.

### Scenario: a new project opens with the story in focus

```
Given a new project
When the writer opens the app
Then the story is in focus, with beats 1 to 5 under it
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 1":
    - heading "Beat 1" [level=3]:
      - button "Beat 1"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 2":
    - heading "Beat 2" [level=3]:
      - button "Beat 2"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 3":
    - heading "Beat 3" [level=3]:
      - button "Beat 3"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 4":
    - heading "Beat 4" [level=3]:
      - button "Beat 4"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 5":
    - heading "Beat 5" [level=3]:
      - button "Beat 5"
    - text: One-sentence summary
    - textbox "One-sentence summary"
```

### Scenario: clicking a beat focuses it

```
Given a new project
When the writer clicks beat 2
Then beat 2 is in focus, with the story above it and beats 1, 3, 4 and 5 beside it
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]:
      - button "The story"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 1":
    - heading "Beat 1" [level=3]:
      - button "Beat 1"
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
  - group "Beat 3":
    - heading "Beat 3" [level=3]:
      - button "Beat 3"
  - group "Beat 4":
    - heading "Beat 4" [level=3]:
      - button "Beat 4"
  - group "Beat 5":
    - heading "Beat 5" [level=3]:
      - button "Beat 5"
```

### Scenario: the arrow keys move across a level

```
Given a new project
When the writer clicks beat 2
And presses →
Then beat 3 is in focus, with beats 1, 2, 4 and 5 beside it
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]:
      - button "The story"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 1":
    - heading "Beat 1" [level=3]:
      - button "Beat 1"
  - group "Beat 2":
    - heading "Beat 2" [level=3]:
      - button "Beat 2"
  - group "Beat 3":
    - heading "Beat 3" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
  - group "Beat 4":
    - heading "Beat 4" [level=3]:
      - button "Beat 4"
  - group "Beat 5":
    - heading "Beat 5" [level=3]:
      - button "Beat 5"
```

### Scenario: stepping down to a scene and back up

```
Given a project with two scenes under beat 2
When the writer clicks beat 2
And presses ↓
Then scene 1 under beat 2 is in focus, with beat 2 above it and scene 2 beside it
And presses ↑
Then beat 2 is in focus, with scenes 1 and 2 under it
Then the writer sees
- main:
  - group "The story":
    - heading "The story" [level=2]:
      - button "The story"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Beat 1":
    - heading "Beat 1" [level=3]:
      - button "Beat 1"
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
  - group "Scene 1":
    - heading "Scene 1" [level=4]:
      - button "Scene 1"
    - text: List line
    - textbox "List line"
  - group "Scene 2":
    - heading "Scene 2" [level=4]:
      - button "Scene 2"
    - text: List line
    - textbox "List line"
  - group "Beat 3":
    - heading "Beat 3" [level=3]:
      - button "Beat 3"
  - group "Beat 4":
    - heading "Beat 4" [level=3]:
      - button "Beat 4"
  - group "Beat 5":
    - heading "Beat 5" [level=3]:
      - button "Beat 5"
```

### Scenario: stepping down returns to the scene the writer left

```
Given a project with two scenes under beat 2
When the writer clicks beat 2
And presses ↓
And presses →
And presses ↑
And presses ↓
Then scene 2 under beat 2 is in focus
Then the writer sees
- main:
  - group "Beat 2":
    - heading "Beat 2" [level=3]:
      - button "Beat 2"
    - text: One-sentence summary
    - textbox "One-sentence summary"
  - group "Scene 1":
    - heading "Scene 1" [level=4]:
      - button "Scene 1"
  - group "Scene 2":
    - heading "Scene 2" [level=4]
    - text: List line
    - textbox "List line"
```
