FROM mcr.microsoft.com/devcontainers/javascript-node:24

USER root
RUN apt-get update && apt-get install -y \
    python3-pip \
    python3-venv \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && ln -sf /usr/bin/python3 /usr/bin/python \
    && ln -sf /usr/bin/pip3 /usr/bin/pip

RUN mkdir -p /home/node/.vscode-server/extensions \
    && mkdir -p /home/node/.vscode-server/data/User/globalStorage \
    && chown -R node:node /home/node/.vscode-server

# Manage pnpm via Corepack — the exact version comes from package.json "packageManager"
RUN corepack enable

USER node