Rule: what the writer types into a piece is still there after a reload.

### Scenario: the story sentence survives a reload

```
Given a new project
When the writer types "A widow hunts the man who sank her husband's ship" as the story's one-sentence summary
And reloads the app
Then the story's one-sentence summary on its card reads "A widow hunts the man who sank her husband's ship"
- banner:
  - heading "working-title" [level=1]
  - navigation "Where you are":
    - list:
      - listitem: The story
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

### Scenario: a beat's one-sentence summary, paragraph and page survive a reload

```
Given a new project
When the writer types "Maren finds the ship's log and learns the sinking was no accident" as beat 2's one-sentence summary
And the writer opens beat 2 beside the graph
And the writer types "Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident." as beat 2's paragraph beside the graph
And the writer types "Maren rows out to the wreck at low tide and finds the hull holed from inside. Back in port, the harbourmaster's log has the night of the sinking torn out, and he names a clerk who died last winter. She takes the log to her husband's old mate, who reads the remaining entries and goes quiet: the ship was carrying something its manifest never listed." as beat 2's page beside the graph
And reloads the app
And the writer opens beat 2 beside the graph
Then beat 2's one-sentence summary on its card reads "Maren finds the ship's log and learns the sinking was no accident"
And beat 2's paragraph beside the graph reads "Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident."
And beat 2's page beside the graph reads "Maren rows out to the wreck at low tide and finds the hull holed from inside. Back in port, the harbourmaster's log has the night of the sinking torn out, and he names a clerk who died last winter. She takes the log to her husband's old mate, who reads the remaining entries and goes quiet: the ship was carrying something its manifest never listed."
- banner:
  - heading "working-title" [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem: Beat 2
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
      - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
      - button "Add a scene"
      - button "Open beside" [pressed]
    - group "Beat 3":
      - heading "Beat 3" [level=3]:
        - button "Beat 3"
    - group "Beat 4":
      - heading "Beat 4" [level=3]:
        - button "Beat 4"
    - group "Beat 5":
      - heading "Beat 5" [level=3]:
        - button "Beat 5"
- complementary "Beat 2":
  - heading "Beat 2" [level=2]
  - button "Close"
  - text: One-sentence summary
  - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
  - text: Paragraph
  - textbox "Paragraph": Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident.
  - text: Page
  - textbox "Page": "Maren rows out to the wreck at low tide and finds the hull holed from inside. Back in port, the harbourmaster's log has the night of the sinking torn out, and he names a clerk who died last winter. She takes the log to her husband's old mate, who reads the remaining entries and goes quiet: the ship was carrying something its manifest never listed."
```

### Scenario: a scene's list line and narrative survive a reload

```
Given a project with two scenes under beat 2
When the writer types "Maren bribes the harbourmaster for the log" as scene 2's list line under beat 2
And the writer opens scene 2 under beat 2 beside the graph
And the writer types "Maren waits for the harbourmaster's shift to end and finds him at the tavern. He wants more than she has. She puts her husband's watch on the table, and he slides the log across without looking at it." as scene 2 under beat 2's narrative beside the graph
And reloads the app
And the writer clicks beat 2
And the writer opens scene 2 under beat 2 beside the graph
Then scene 2's list line under beat 2 on its card reads "Maren bribes the harbourmaster for the log"
And scene 2 under beat 2's narrative beside the graph reads "Maren waits for the harbourmaster's shift to end and finds him at the tavern. He wants more than she has. She puts her husband's watch on the table, and he slides the log across without looking at it."
- banner:
  - heading "working-title" [level=1]
  - navigation "Where you are":
    - list:
      - listitem:
        - button "The story"
      - listitem:
        - button "Beat 2"
      - listitem: Scene 2
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
      - textbox "List line": Maren bribes the harbourmaster for the log
      - button "Open beside" [pressed]
- complementary "Scene 2":
  - heading "Scene 2" [level=2]
  - button "Close"
  - text: List line
  - textbox "List line": Maren bribes the harbourmaster for the log
  - text: Narrative
  - textbox "Narrative": Maren waits for the harbourmaster's shift to end and finds him at the tavern. He wants more than she has. She puts her husband's watch on the table, and he slides the log across without looking at it.
```
