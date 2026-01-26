# Working Title Project

This project is a Vue 3 + TypeScript + Vite application.

## Getting Started

### Using Dev Containers (Recommended)

This project uses dev containers to provide a secure, isolated development environment.

**Prerequisites:**

- Container runtime ([Docker Desktop](https://www.docker.com/products/docker-desktop), [Colima](https://github.com/abiosoft/colima), or similar)
- [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

**Quick Start:**

1. Clone the repository
2. Open the project in VS Code
3. When prompted, click "Reopen in Container" (or run "Dev Containers: Reopen in Container" from the command palette)
4. The container will automatically:
   - Set up Node.js and pnpm
   - Install all project dependencies and Playwright browsers
   - Configure VS Code extensions (Vue, ESLint, Prettier, Tailwind CSS, Playwright)
   - Forward ports 5173 (Vite dev server) and 6006 (Storybook)

Once the container is ready, you can start development with `./do dev` or `./do storybook`.

### Local Development (Without Dev Containers)

**Setup:**

```bash
./do bootstrap  # Install dependencies and Playwright browsers
./do dev        # Start development server
```

## Development Commands

This project uses a `./do` script to standardize development commands. You can list all available commands by running `./do` or `./do help`.

```bash
./do
```

### Available commands:

#### Setup

- `bootstrap`: Installs dependencies and Playwright browsers (run once when setting up the project).
- `install`: Installs dependencies with a frozen lockfile.
- `playwright-install`: Installs Playwright browsers and system dependencies.

#### Core Development

- `dev`: Starts development server via Vite.
- `build`: Builds the project for production.
- `storybook`: Starts Storybook development server.

#### Testing & Quality

- `test`: Runs tests via vitest. Usage: `./do test [--watch]`
- `e2e`: Runs end-to-end tests via Playwright. Usage: `./do e2e [--ui]`
  - To test against a specific environment: `BASE_URL=https://staging.example.com ./do e2e`
- `lint`: Lints the project files. Usage: `./do lint [--fix]`

#### Maintenance

- `outdated`: Checks for outdated dependencies, respecting minimumReleaseAge.
- `audit`: Runs a security audit for dependencies.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).
