---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
metadata:
  internal: true
---

<!-- Adapted from superpowers by Jesse Vincent (MIT). See LICENSE in this directory. -->

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Directory Selection Process

Follow this priority order:

### 1. Check Existing Directories

```bash
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

**If found:** Use that directory. If both exist, `.worktrees` wins.

### 2. Check CLAUDE.md

```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

**If preference specified:** Use it without asking.

### 3. Ask User

If no directory exists and no CLAUDE.md preference:

```
No worktree directory found. Where should I create worktrees?
1. .worktrees/ (project-local, hidden)
2. ~/.config/worktrees/<project-name>/ (global location)
```

## Safety Verification

### For Project-Local Directories (.worktrees or worktrees)

**MUST verify the directory is ignored before creating a worktree:**

```bash
git check-ignore -q .worktrees 2>/dev/null || git check-ignore -q worktrees 2>/dev/null
```

**If NOT ignored:** add the line to `.gitignore`, commit it, then proceed. **Why critical:** prevents accidentally committing worktree contents.

### For Global Directory

No `.gitignore` verification needed — outside the project entirely.

## Creation Steps

### 1. Detect Project Name

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

### 2. Create Worktree

```bash
case $LOCATION in
  .worktrees|worktrees) path="$LOCATION/$BRANCH_NAME" ;;
  ~/.config/worktrees/*) path="~/.config/worktrees/$project/$BRANCH_NAME" ;;
esac

git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"
```

### 3. Run Project Setup

This project uses pnpm and the `./do` task runner:

```bash
if [ -f package.json ]; then pnpm install && ./do bootstrap; fi
```

### 4. Verify Clean Baseline

```bash
./do check 2>&1 | tee /tmp/baseline.log   # or: ./do lint . && ./do build && ./do test
```

**If checks fail:** report failures, ask whether to proceed or investigate.
**If they pass:** report ready.

### 5. Report Location

```
Worktree ready at <full-path>
Baseline green
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| `.worktrees/` exists | Use it (verify ignored) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check CLAUDE.md, then ask user |
| Directory not ignored | Add to .gitignore + commit |
| Baseline checks fail | Report + ask |

## Red Flags

**Never:**
- Create a worktree without verifying it's ignored (project-local)
- Skip baseline verification
- Proceed with failing checks without asking
- Assume the directory location when ambiguous

**Always:**
- Follow directory priority: existing > CLAUDE.md > ask
- Verify the directory is ignored for project-local
- Run project setup (`pnpm install` + `./do bootstrap`)
- Verify a clean baseline before implementing
