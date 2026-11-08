Rule: once a new version of the app has installed, the open tab keeps the version it loaded until the writer reloads, and a quiet notice tells them a new one is waiting.
Sees: the app
Serves: a private build

### Scenario: a new version waits for the writer

```
Given a new project
And the writer types "A widow hunts the man who sank her husband's ship" as the story's one-sentence summary
When a new version is installed
Then the writer sees
- banner:
  - heading "working-title" [level=1]
  - navigation "Where you are":
    - list:
      - listitem: The story
  - status:
    - text: A new version is ready.
    - button "Reload"
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]
      - text: One-sentence summary
      - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
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

### Scenario: reloading opens the new version

```
Given a new project
And the writer types "A widow hunts the man who sank her husband's ship" as the story's one-sentence summary
And a new version is installed
And a notice says a new version is ready
When the writer reloads from the notice
Then the app opens on the new version
And the story's one-sentence summary on its card reads "A widow hunts the man who sank her husband's ship"
Then the writer sees
- banner:
  - heading "working-title" [level=1]
  - navigation "Where you are":
    - list:
      - listitem: The story
  - status
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]
      - text: One-sentence summary
      - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
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
