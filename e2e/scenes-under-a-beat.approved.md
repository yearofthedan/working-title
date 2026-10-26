Rule: the writer can add scenes under any beat, each new scene going after that beat's existing scenes and brought into view, and each scene keeps the list line the writer types after a reload.

### Scenario: scenes are added under a beat

```
Given a new project
When the writer adds a scene under beat 2
And adds a scene under beat 4
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
    - heading "Beat 3" [level=3]:
      - button "Beat 3"
  - group "Beat 4":
    - heading "Beat 4" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
  - group "Scene 1":
    - heading "Scene 1" [level=4]:
      - button "Scene 1"
    - text: List line
    - textbox "List line"
  - group "Beat 5":
    - heading "Beat 5" [level=3]:
      - button "Beat 5"
```

### Scenario: a scene's list line survives a reload

```
Given a new project
When the writer adds two scenes under beat 2
And types "Maren bribes the harbourmaster for the log" as scene 2's list line under beat 2
And reloads the app
And the writer clicks beat 2
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
    - textbox "List line": Maren bribes the harbourmaster for the log
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
