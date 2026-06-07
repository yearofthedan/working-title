#!/bin/bash
set -euo pipefail

# Fix permissions on folders after volumes are mounted
sudo chown -R node:node /home/node/.vscode-server ${containerWorkspaceFolder}

# Install the weaver refactoring CLI globally
npm install -g @yearofthedan/weaver@0.1.5

# Install the Playwright agent CLI globally (browser inspect loop)
npm install -g @playwright/cli@0.1.13

# Authenticate with GitHub if needed
if ! gh auth status &>/dev/null; then
  echo "🔐 GitHub authentication required"
  # Use non-interactive login if GITHUB_TOKEN is available (e.g. for agents/CI)
  # Otherwise, use interactive device flow since browsers won't open in containers
  if [ -z "${GITHUB_TOKEN:-}" ]; then
    gh auth login --hostname github.com --git-protocol https --web -s user -s repo
  else
    echo "Using GITHUB_TOKEN for authentication"
  fi
fi

# Pull code if it doesn't already exist
[ -d ".git" ] || git clone https://github.com/yearofthedan/working-title.git .

# Configure repo-local git identity.
# Prefer explicit GH_USER/GH_EMAIL overrides (e.g. for agents/CI); otherwise
# derive from the logged-in `gh` account. The constructed no-reply email keeps
# the personal address private.
GH_USER="${GH_USER:-$(gh api user -q '.login' 2>/dev/null || true)}"
GH_ID="${GH_ID:-$(gh api user -q '.id' 2>/dev/null || true)}"

if [ -n "$GH_USER" ]; then
  GH_EMAIL="${GH_EMAIL:-${GH_ID}+${GH_USER}@users.noreply.github.com}"
  git config user.name "$GH_USER"
  git config user.email "$GH_EMAIL"
  echo "✅ Git identity configured: $GH_USER <$GH_EMAIL>"
else
  echo "⚠️  Could not determine GitHub user; git identity not configured."
fi
