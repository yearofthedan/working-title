Rule: the current card shows the keys that move from it while the card itself has keyboard focus.

### Scenario: the current card shows the keys that move from it while the card itself has keyboard focus

```
Given a beat card is current with tab focus
Then the writer sees
- main:
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
    - paragraph: Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level
```

### Scenario: the current card shows no keys while the focus is in one of its fields

```
Given a beat card is current with focus in its one-sentence summary
Then the writer sees
- main:
  - group "Beat 2":
    - heading "Beat 2" [level=3]
    - text: One-sentence summary
    - textbox "One-sentence summary"
    - button "Add a scene"
```
