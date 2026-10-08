# 6. Approved scenarios as the behaviour spec

Status: Accepted, 2026-10-04

## Context

Agents write both the code and its tests, and a person has to judge behaviour. Assertion code is hard to review and easy to make pass on wrong code. Options: assertion-style tests, Gherkin and Cucumber, or approved scenarios.

## Decision

Use-case tests are the bulk. Each writes a readable `.approved.md` in glossary words through a dedicated printer, and the reviewer approves behaviour by reading its diff. CI never writes or updates approvals.

## Consequences

Use cases run against in-memory fakes of the ports, so port contract tests keep fakes honest. The printer is separate from the folder format, so a format change does not rewrite every approval. Rubber-stamping is the known failure mode; mutation testing checks that tests would fail on wrong code.
