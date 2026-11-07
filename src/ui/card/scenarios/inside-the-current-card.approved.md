Rule: Inside the current card, tabbing moves focus only between the card's inputs and actions, and Esc moves focus back to the card.

### Scenario: Enter moves focus into the current card

```
Given a beat card is current with tab focus
When the writer presses Enter
Then focus moves to the one-sentence summary
- main:
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary" [active]
    - button "Add a scene"
    - button "Open beside"
```

### Scenario: tabbing forward moves focus to the card's next action

```
Given a beat card is current with focus in its one-sentence summary
When the writer tabs forward
Then focus moves to "Add a scene"
- main:
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene" [active]
    - button "Open beside"
```

### Scenario: tabbing forward from the card's last action returns to its first input

```
Given a beat card is current with focus on "Open beside"
When the writer tabs forward
Then focus moves to the one-sentence summary
- main:
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary" [active]
    - button "Add a scene"
    - button "Open beside"
```

### Scenario: Esc moves focus back to the card

```
Given a beat card is current with focus in its one-sentence summary
When the writer presses Esc
Then focus moves to the card
- main:
  - group "Beat 2" [active]:
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
    - button "Open beside"
    - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
```

### Scenario: a click on the card shows no keys

```
Given a beat card is current
When the writer clicks the card
Then focus moves to the card
- main:
  - group "Beat 2" [active]:
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
    - button "Open beside"
```
