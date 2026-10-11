# Dependencies

**Audience:** anyone adding, updating or removing a dependency.
**Purpose:** the rules a dependency change has to satisfy, and what enforces each.

- **Installs hold a release back.** No release younger than the cutoff in `pnpm-workspace.yaml` is resolved, and one whose publisher trust is weaker than an earlier release's is refused ([minimumReleaseAge](https://pnpm.io/settings/dependency-resolution#minimumreleaseage), [trustPolicy](https://pnpm.io/settings/dependency-resolution#trustpolicy)).
- **An exception carries its reason beside it.** An entry in `minimumReleaseAgeExclude` or `trustPolicyExclude` has a comment above the list saying why it stays, as the two in `pnpm-workspace.yaml` do.
- **An update arrives as a Renovate pull request**, on the schedule in `renovate.json` and after the same wait, which [one test](../pnpm-workspace.test.ts) holds to the cutoff above ([Renovate](https://docs.renovatebot.com/)).
- **A bump of the pnpm version this repository pins is where its release notes get read, before merging.** pnpm is what enforces the two rules above, and a bump to it can change what they mean. The `pnpm` rule in `renovate.json` puts that instruction in the pull request's body, so it is not left to memory.
- **What a check refuses is the check's own message**: [`./do audit`](../scripts/audit) for an advisory a change brings in, [`./do secrets`](../scripts/secrets) for a credential, and [`./do check`](../scripts/check) for the rest.
