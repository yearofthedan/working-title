#!/bin/bash

# Fix permissions on folders after volumes are mounted
sudo chown -R node:node /home/node/.vscode-server ${containerWorkspaceFolder}

# Pull code 
[ -d ".git" ] || git clone https://github.com/yearofthedan/working-title.git .
