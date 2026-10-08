# 6. Approved scenarios as the behaviour spec

Status: Accepted, 2026-10-04

## Context

How is behaviour specified and checked, when agents write both the code and its tests?

- **Agents test themselves.** Agents write both the code and its tests. Tests that pass on wrong code are the main risk.
- **Behaviour review.** The person who accepts the work reviews behaviour, not code, in pull request diffs.
- **Hidden behaviour.** Assertion code hides behaviour behind setup and matchers.
- **Upkeep.** Every layer between the spec and the code is something to maintain.

## Options considered

| Option | Agents test themselves | Behaviour review | Hidden behaviour | Upkeep |
| --- | --- | --- | --- | --- |
| Approved scenarios | Diff shows any change; mutation testing backs it | Read the diff | Printed in glossary words | A printer and builders |
| Assertion-style tests | Easy to pass on wrong code | Read test code | Hidden | Low |
| Gherkin and Cucumber | Readable specs | Read the feature file | Visible | Parser and step definitions |

## Decision

Use-case tests are the bulk. Each writes a readable `.approved.md` in glossary words through a dedicated printer, and the reviewer approves behaviour by reading its diff. CI never writes or updates approvals.

## Consequences

Use cases run against in-memory fakes of the ports, so port contract tests keep fakes honest. The printer is separate from the folder format, so a format change does not rewrite every approval. Rubber-stamping is the known failure mode; mutation testing checks that tests would fail on wrong code.
