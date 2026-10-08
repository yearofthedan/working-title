# 6. Approved scenarios as the behaviour spec

Status: Accepted, 2026-10-04

## Context

How is behaviour specified and checked, when agents write both the code and its tests?

- Agents write both the code and its tests. Tests that pass on wrong code are the main risk.
- The person who accepts the work reviews behaviour, not code, and reviews in pull request diffs.
- Assertion code hides behaviour behind setup and matchers.
- Gherkin and Cucumber add a parsing layer and step definitions to maintain.

## Decision

Use-case tests are the bulk. Each writes a readable `.approved.md` in glossary words through a dedicated printer, and the reviewer approves behaviour by reading its diff. CI never writes or updates approvals.

## Alternatives considered

- **Assertion-style tests.** Standard and well supported, but behaviour is hidden in setup and matchers, so reviewing it means reading test code.
- **Gherkin and Cucumber.** Readable specs, but a parsing layer and step definitions to maintain, and scenarios that drift from what the code actually does.

## Consequences

Use cases run against in-memory fakes of the ports, so port contract tests keep fakes honest. The printer is separate from the folder format, so a format change does not rewrite every approval. Rubber-stamping is the known failure mode; mutation testing checks that tests would fail on wrong code.
