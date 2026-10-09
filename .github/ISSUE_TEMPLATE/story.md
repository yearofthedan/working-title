---
name: Story
about: A thin slice the writer can use on its own, landing as one pull request
title: ""
labels: story
---

<!-- Add this issue as a sub-issue of its epic's issue, in the epic's milestone. -->

## Outcome

As a ___, I want ___, so that ___.

## Delivers

<!-- The line of the epic's Is list this story makes true, quoted. When the story makes only part of a line true, quote that part. -->

## Acceptance criteria

<!-- Agreed before any code. The definition of done in docs/dev-flow.md always applies.
Rule: one sentence stating the rule the scenarios illustrate. It carries the precision and goes into the approved file.
Scenarios: Given/When/Then in the ubiquitous language, titled with the behaviour, ending in the expected Then. One per outcome the writer would see differently; with real unknowns, the full .approved.md is drafted and approved before any code.
Edges: cases specific to this story where the code could break but the writer sees nothing new, names only. If the writer would see a different result, it is a scenario instead. Each edge has a test in the PR.
Anything that is not behaviour (speed, durability, a check in CI): one line with its threshold and the test that measures it. -->

Rule: 

### Scenario: 

```
Given 
When 
Then 
```

Edges: 

- 

## Is not

<!-- Near misses a reader might expect here, each naming the story or epic where it lives. -->

-

## Pointers

<!-- Optional: links to the Architecture sections this story touches, one line each. -->
