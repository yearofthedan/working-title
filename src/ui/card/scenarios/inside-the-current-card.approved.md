Rule: Inside the current card, tabbing moves focus only between the card's inputs and actions, and Esc moves focus back to the card.

### Scenario: Enter moves focus into the current card

```
Given a Beat card is current with tab focus
When the writer presses Enter
Then focus moves to the one-sentence summary
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

### Scenario: tabbing forward moves focus to the card's next action

```
Given a Beat card is current with focus in its one-sentence summary
When the writer tabs forward
Then focus moves to "Add a scene"
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

### Scenario: tabbing forward from the card's last action returns to its first input

```
Given a Beat card is current with focus on "Add a scene"
When the writer tabs forward
Then focus moves to the one-sentence summary
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

### Scenario: Esc moves focus back to the card

```
Given a Beat card is current with focus in its one-sentence summary
When the writer presses Esc
Then focus moves to the card
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
