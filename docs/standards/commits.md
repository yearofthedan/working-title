# Commits and merges

**Audience:** anyone landing a change here.
**Purpose:** what a change's messages look like, on the branch and in the log.

- **The issue number leads the subject** of a pull request title and of every commit: `15: Check claims against their docs`. Merges are the exception, since `Merge branch 'main' into …` has its own shape.
- **A change reaches `main` through a pull request, squash-merged**, so the pull request title is the message that lands; [GitHub's squash settings](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/configuring-commit-squashing-for-pull-requests) describe the default message and the fact that whoever merges can edit it. Rebase-merging would put the branch's commits on `main` as they are, which is why the issue number leads every commit as well as the title.
- **The pull request body names who wrote it**: the tool and model that did the work, and the models that reviewed it. The body outlives the branch; the merge carries the title alone.
- **The ruleset that requires this** — a pull request, squash only, the check required by name — belongs to CI, so nothing enforces it yet ([#16](https://github.com/yearofthedan/working-title/issues/16)).
