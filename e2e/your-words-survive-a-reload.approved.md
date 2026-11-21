Rule: what the writer types into a piece is still there after a reload.
Sees: the app

### Scenario: the story sentence survives a reload

```
Given a new project
When the writer types "A widow hunts the man who sank her husband's ship" as the story's one-sentence summary
And reloads the app
Then the story's one-sentence summary on its card reads "A widow hunts the man who sank her husband's ship"
- main:
  - toolbar "The story":
    - group "The story" [current]:
      - textbox "One-sentence summary": A widow hunts the man who sank her husband's ship
```

### Scenario: a beat's one-sentence summary, paragraph and page survive a reload

```
Given a project with a beat
When the writer types "Maren finds the ship's log and learns the sinking was no accident" as beat 1's one-sentence summary
And the writer opens beat 1 beside the graph
And the writer types "Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident." as beat 1's paragraph beside the graph
And the writer types "Maren rows out to the wreck at low tide and finds the hull holed from inside. Back in port, the harbourmaster's log has the night of the sinking torn out, and he names a clerk who died last winter. She takes the log to her husband's old mate, who reads the remaining entries and goes quiet: the ship was carrying something its manifest never listed." as beat 1's page beside the graph
And reloads the app
And the writer opens beat 1 beside the graph
Then beat 1's one-sentence summary on its card reads "Maren finds the ship's log and learns the sinking was no accident"
- main:
  - toolbar "Beats under The story":
    - group "Beat 1" [current]:
      - textbox "One-sentence summary": Maren finds the ship's log and learns the sinking was no accident
And beat 1's paragraph beside the graph reads "Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident."
- complementary "Beat 1":
  - textbox "Paragraph": Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident.
And beat 1's page beside the graph reads "Maren rows out to the wreck at low tide and finds the hull holed from inside. Back in port, the harbourmaster's log has the night of the sinking torn out, and he names a clerk who died last winter. She takes the log to her husband's old mate, who reads the remaining entries and goes quiet: the ship was carrying something its manifest never listed."
- complementary "Beat 1":
  - textbox "Page": "Maren rows out to the wreck at low tide and finds the hull holed from inside. Back in port, the harbourmaster's log has the night of the sinking torn out, and he names a clerk who died last winter. She takes the log to her husband's old mate, who reads the remaining entries and goes quiet: the ship was carrying something its manifest never listed."
```

### Scenario: a scene's list line and narrative survive a reload

```
Given a project with two scenes under beat 1
When the writer types "Maren bribes the harbourmaster for the log" as scene 2's list line under beat 1
And the writer opens scene 2 under beat 1 beside the graph
And the writer types "Maren waits for the harbourmaster's shift to end and finds him at the tavern. He wants more than she has. She puts her husband's watch on the table, and he slides the log across without looking at it." as scene 2 under beat 1's narrative beside the graph
And reloads the app
And the writer clicks beat 1
And the writer opens scene 2 under beat 1 beside the graph
Then scene 2's list line under beat 1 on its card reads "Maren bribes the harbourmaster for the log"
- main:
  - toolbar "Scenes under Beat 1":
    - group "Scene 2" [current]:
      - textbox "List line": Maren bribes the harbourmaster for the log
And scene 2 under beat 1's narrative beside the graph reads "Maren waits for the harbourmaster's shift to end and finds him at the tavern. He wants more than she has. She puts her husband's watch on the table, and he slides the log across without looking at it."
- complementary "Scene 2":
  - textbox "Narrative": Maren waits for the harbourmaster's shift to end and finds him at the tavern. He wants more than she has. She puts her husband's watch on the table, and he slides the log across without looking at it.
```

### Scenario: a scene's prose survives a reload

```
Given a project with two scenes under beat 1
When the writer clicks beat 1
And the writer opens scene 2 under beat 1 beside the graph
And the writer types "The tavern was half empty. Hollis sat where he always sat, back to the wall, and didn't look up when she pulled out the chair." as scene 2 under beat 1's prose beside the graph
And reloads the app
And the writer clicks beat 1
And the writer opens scene 2 under beat 1 beside the graph
Then scene 2 under beat 1's prose beside the graph reads "The tavern was half empty. Hollis sat where he always sat, back to the wall, and didn't look up when she pulled out the chair."
- complementary "Scene 2":
  - textbox "Prose": The tavern was half empty. Hollis sat where he always sat, back to the wall, and didn't look up when she pulled out the chair.
And scene 2 under beat 1's narrative beside the graph reads ""
- complementary "Scene 2":
  - textbox "Narrative"
```
