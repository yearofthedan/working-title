FROM mcr.microsoft.com/devcontainers/javascript-node:24

# Create folders and permissions for vscode mounts. Needed for persistence of vscode extensions
RUN mkdir -p /home/node/.vscode-server/extensions \
    && mkdir -p /home/node/.vscode-server/data/User/globalStorage \
    && chown -R node:node /home/node/.vscode-server