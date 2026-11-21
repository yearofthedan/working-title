Rule: Tabbing moves focus to the next or previous row's first piece, and never changes which piece is current.

### Scenario: tabbing forward moves focus to the next row

```
Given a project with two scenes under beat one
And beat one is current with tab focus
When the writer tabs forward
Then focus moves to scene one under beat one
- main:
  - toolbar "Scenes under Beat 1":
    - group "Scene 1":
      - heading "Scene 1" [level=4]:
        - button "Scene 1" [active]
      - text: List line
      - textbox "List line"
      - button "Open beside"
But beat one stays current
- main:
  - toolbar "Beats under The story":
    - group "Beat 1" [current]:
      - heading "Beat 1" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
```

### Scenario: tabbing backward moves focus to the previous row

```
Given a project with two scenes under beat one
And beat one is current with tab focus
When the writer tabs backward
Then focus moves to the story
- main:
  - toolbar "The story":
    - group "The story":
      - heading "The story" [level=2]:
        - button "The story" [active]
      - text: One-sentence summary
      - textbox "One-sentence summary"
But beat one stays current
- main:
  - toolbar "Beats under The story":
    - group "Beat 1" [current]:
      - heading "Beat 1" [level=3]
      - text: One-sentence summary
      - textbox "One-sentence summary"
      - button "Add a scene"
      - button "Open beside"
```
