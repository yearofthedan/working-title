Rule: a project starts in the folder where the writer keeps their projects, chosen once, and the app makes the project's folder there, named after its title.

### Scenario: choosing an empty folder to keep projects in

```
Given the writer has not chosen where to keep their projects
And a folder "Writing" on the writer's machine is empty
When the writer chooses "Writing" to keep their projects in
Then Your projects, in "Writing", lists no projects
- banner:
  - heading "Your projects" [level=1]
- main:
  - region "In Writing":
    - heading "In Writing" [level=2]
    - paragraph: No projects yet.
```

### Scenario: starting a project opens it under its title

```
Given the writer keeps their projects in a folder
When the writer starts a project titled "The Ferryman"
Then the header names the project "The Ferryman"
- banner:
  - heading "The Ferryman" [level=1]
And focus is in the story's one-sentence summary
- main:
  - toolbar "The story":
    - group "The story" [current]:
      - textbox "One-sentence summary" [active]
```

### Scenario: a project started without a title is untitled

```
Given the writer keeps their projects in a folder
When the writer starts a project with no title
Then the header names the project "Untitled project"
- banner:
  - heading "Untitled project" [level=1]
```

### Scenario: a project never starts inside another project's folder

```
Given the writer keeps their projects in a folder that holds a project's folder named "The Ferryman"
When the writer starts a project titled "The Ferryman"
Then the new project's files are in a folder "The Ferryman 2" beside it
- folder "The Ferryman 2":
  - file "project.md":
    ---
    title: "The Ferryman"
    method: snowflake-extended
    version: 2
    ---
But the files in "The Ferryman" are as they were
- folder "The Ferryman":
  - file "project.md":
    ---
    title: "The Ferryman"
    method: snowflake-extended
    version: 2
    ---
```

### Scenario: a project's own folder is not where projects are kept

```
Given the writer has not chosen where to keep their projects
When the writer chooses the folder of a project titled "The Ferryman"
Then the app says "“The Ferryman” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead."
- main:
  - region "Choose where to keep your projects":
    - alert: “The Ferryman” is a project's own folder, so it can't hold other projects. Choose the folder it sits in instead.
```
