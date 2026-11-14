Rule: once a new version of the app has installed, the open tab keeps the version it loaded until the writer reloads, and a quiet notice tells them a new one is waiting.
Sees: the app
Serves: a private build

### Scenario: a new version waits for the writer

```
Given a new project
When a new version is installed
Then a notice says a new version is ready
- status:
  - text: A new version is ready.
  - button "Reload"
```
