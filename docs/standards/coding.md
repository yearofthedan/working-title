# Coding

**Audience:** anyone writing or reviewing code here.
**Purpose:** the conventions code has to satisfy, beyond what the formatter and linter enforce.

## Comments

There is almost never a reason for a comment. Each reason to write one has a counter:

- **"The code isn't clear without a comment."** If the module isn't cohesive, split it into cohesive parts. If the function is too complex, extract smaller functions, move to a functional style, or invert control. If it isn't named for what it does, rename it.
- **"The comment protects a core behaviour or a standard from being undone."** A behaviour or a standard that matters is tested, so the comment marks a missing test.
- **"The comment explains odd behaviour in a library or the platform."** Put the library behind an adapter, where the port-to-adapter mapping shows the behaviour, and test it. Where there is no adapter, as in a shell script or a platform fact, test it.

A comment is allowed only when it starts with one of these prefixes, after the comment marker:

- `shortcut: <the limit>, <when to upgrade>`, for a known limit;
- `workaround: <issue link>`, for code that patches a bug in a library or the platform, linking the bug;
- `help: <text>`, the line `./do` lists for a task;
- a directive a tool reads: `@ts-expect-error`, `oxlint-disable…`, `@type`.

A `//` or `#` comment is one line. A longer comment is a `/* … */` block, which shell does not have, so a shell comment is always one line.

## Configuration

A configuration file follows the same rule. A comment on a setting goes one of three ways:

- If the file is hard to read without it, extract a named module or helper, or rename one, so the name says what the comment said.
- A known limit becomes a `shortcut:`.
- Otherwise it goes. The reason for a value is in the history of the change that set it, one `git blame` away, and a copy of it in the file goes stale.

Whether a setting gets a test is in [Testing](testing.md#levels-and-names).
