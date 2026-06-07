#!/bin/bash
set -euo pipefail

# Fix permissions on folders after volumes are mounted
sudo chown -R node:node /home/node/.vscode-server ${containerWorkspaceFolder}

# Install the weaver refactoring CLI globally
npm install -g @yearofthedan/weaver@0.1.5

# Install the Playwright agent CLI globally (browser inspect loop)
npm install -g @playwright/cli@0.1.13

# Pull code if it doesn't already exist
[ -d ".git" ] || git clone https://github.com/yearofthedan/working-title.git .

# GitHub auth and git identity are a deliberate manual step — run `./do bootstrap-gh`
# after the container is up (postStart.sh reminds you).
