# Dependencies

**Audience:** anyone adding, updating or removing a dependency.
**Purpose:** the rules a dependency change has to satisfy, and what enforces each.

- **Installs hold a release back.** No release younger than the cutoff in `pnpm-workspace.yaml` is resolved, and one whose publisher trust is weaker than an earlier release's is refused ([minimumReleaseAge](https://pnpm.io/settings/dependency-resolution#minimumreleaseage), [trustPolicy](https://pnpm.io/settings/dependency-resolution#trustpolicy)).
- **An exception carries its reason beside it**, in the same file, as its two entries do.
- **An update arrives as a Renovate pull request**, on the schedule in `renovate.json` and after the same wait ([Renovate](https://docs.renovatebot.com/)).
- **A bump of the pnpm version this repository pins is where pnpm's migration notes get read**, for the two settings above. The `pnpm` rule in `renovate.json` says so in the pull request's body, and the three days there and the cutoff above are held together by [one test](../pnpm-workspace.test.ts).
- **What a check refuses is the check's own message**: [`./do audit`](../scripts/audit) for an advisory a change brings in, [`./do secrets`](../scripts/secrets) for a credential, and [`./do check`](../scripts/check) for the rest.
