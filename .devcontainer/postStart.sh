#!/bin/bash
set -euo pipefail

# Refresh the Claude Code CLI to the latest version
echo "Updating Claude..."
curl -fsSL https://claude.ai/install.sh | bash || echo "⚠️  Claude update failed, continuing with existing version."

echo "Ready. Run './do bootstrap-gh' to authenticate with GitHub and set your git identity."
