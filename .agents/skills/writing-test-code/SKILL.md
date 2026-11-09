---
name: writing-test-code
description: Use before adding a verb to a *.dsl.ts, a part to a *.test-page.ts, a harness, a driver method or a registration every browser test shares, and before briefing an agent to add one.
---

# Writing test code

Before adding a part or a verb, name the component whose markup it belongs to, open that component's `*.test-page.ts`, `*.dsl.ts` and `*.harness.ts`, and list what they export. Build on what is there, and add what is missing to the owner's file, as [the layers](../../../docs/standards/testing.md#the-layers) say. A brief that asks an agent to add test code carries that list.
