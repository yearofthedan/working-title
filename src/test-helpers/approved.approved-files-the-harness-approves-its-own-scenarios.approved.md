Rule: A scenario test passes only when the scenario it prints matches its approved file, and only `./do approve` changes that file.

### Scenario: A matching scenario passes

```
Given a scenario test whose printed scenario matches its .approved.md
When the tests run
Then it passes
```

### Scenario: A changed behaviour fails with a readable difference

```
Given a scenario test whose printed scenario differs from its .approved.md
When the tests run
Then it fails, showing the difference as scenario lines
 └ and the .approved.md is unchanged
```

### Scenario: A new scenario fails until approved

```
Given a scenario test with no .approved.md
When the tests run
Then it fails, shows the printed scenario, and writes no .approved.md
```

### Scenario: Approving a wanted change

```
Given a failing scenario test whose printed scenario is the one agreed in the story
When ./do approve is run for it
Then its .approved.md holds the printed scenario and the test passes
```
