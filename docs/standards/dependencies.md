# Dependencies

**Audience:** anyone adding, updating or removing a dependency.
**Purpose:** the rules a dependency change has to satisfy, and what enforces each.

- **Installs hold a release back.** No release younger than the cutoff in `pnpm-workspace.yaml` is resolved, and one whose publisher trust is weaker than an earlier release's is refused ([minimumReleaseAge](https://pnpm.io/settings/dependency-resolution#minimumreleaseage), [trustPolicy](https://pnpm.io/settings/dependency-resolution#trustpolicy)).
- **An exception carries its reason beside it.** Every entry in `minimumReleaseAgeExclude` or `trustPolicyExclude` is named by a comment above the list, with the reason it stays. Approving at pnpm's prompt writes the entry alone, so the reason goes in afterwards.
- **An update arrives as a Renovate pull request**, on the schedule in `renovate.json` and after the same wait, which [pnpm-workspace.test.ts](../pnpm-workspace.test.ts) holds to the cutoff above ([Renovate](https://docs.renovatebot.com/)).
- **A bump of the pnpm version this repository pins is read before it merges**, since pnpm is what enforces the rules above.
- **What a check refuses is the check's own message**: [`./do audit`](../scripts/audit) for an advisory a change brings in, [`./do secrets`](../scripts/secrets) for a credential, and [`./do check`](../scripts/check) for the rest.
