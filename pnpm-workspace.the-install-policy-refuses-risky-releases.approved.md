Rule: A dependency release is installed only when it is at least three days old and its publisher trust is no weaker than an earlier release's, unless an exception for it is recorded in a committed file.

### Scenario: A newer version in range is passed over for an older one

```
Given a dependency whose newest version in range is less than three days old
 └ and an older version in range is at least three days old
When the builder installs
Then the older version is installed
```

### Scenario: No version in range is old enough

```
Given a dependency with no version in range at least three days old
When the builder installs without approving an exception
Then the install fails and names the dependency
```

### Scenario: A version under three days old is approved as an exception

```
Given a dependency with no version in range at least three days old
When the builder installs from a terminal and approves it
Then it is installed
 └ and the exception is recorded in a committed file
```

### Scenario: A release with weaker trust is refused

```
Given a dependency version with weaker trust evidence than an earlier release
When the builder installs
Then the install fails and names the dependency and version
```
