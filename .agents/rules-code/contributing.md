## Task Runner

The project uses a [`./do`](../do) script as the primary task runner interface.

### Usage

```bash
./do <command> [args...]
```

### Available Commands

All commands are defined in [`scripts/`](../scripts/) directory:

- `./do dev` - Start development server
- `./do test` - Run tests
- `./do build` - Build for production
- `./do lint` - Run linters
- `./do storybook` - Start Storybook

Run `./do` or `./do help` to see all available commands.

### Creating New Commands

1. Create executable script in `scripts/` directory
2. Add comment at top for command summary
3. Mark utility scripts with `_` prefix (e.g., `_common`) to make them private
