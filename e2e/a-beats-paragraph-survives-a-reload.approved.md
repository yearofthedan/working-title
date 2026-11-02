Rule: the writer opens a beat in the panel beside the graph and types its one-sentence summary and its paragraph there. The panel keeps that beat until the writer closes it or opens another, even while the focus moves, the one-sentence summary reads the same on the card and in the panel, and both are still there after a reload.

### Scenario: a beat's paragraph survives a reload

```
Given a new project
When the writer types "Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident." as beat 2's paragraph
And reloads the app
And opens beat 2 beside the graph
Then beat 2's paragraph reads "Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident."
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
      - textbox "One-sentence summary"
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
  - text: One-sentence summary
  - textbox "One-sentence summary"
  - text: Paragraph
  - textbox "Paragraph": Maren finds the ship's log in the harbourmaster's office, its pages for the night of the sinking torn out. The harbourmaster lies about who took them, and she sees the sinking was no accident.
  - button "Close"
```
