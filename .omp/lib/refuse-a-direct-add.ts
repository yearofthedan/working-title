// This repository is a pnpm shop, and a dependency is added with `./do add`, which
// resolves the candidate in a scratch copy and audits what it brings in before
// anything is installed. This refuses the commands that would resolve a package
// without that audit, so its code never runs here.
//
// The command is read as text, split on the separators a shell acts on and on the
// assignments before the program. Quoting and substitution are not read, so
// `sh -c 'pnpm add x'` is not caught: this is a default, not a boundary.

import { spawnSync } from 'node:child_process';

type ToolCall = { toolName: string; input: Record<string, unknown> };
type Context = { cwd: string };
type ToolCallResult = { block: true; reason: string } | undefined;

export type Extension = {
  on(
    event: 'tool_call',
    handler: (event: ToolCall, context: Context) => ToolCallResult | Promise<ToolCallResult>,
  ): void;
};

const addThroughTheTask =
  'Adding a dependency goes through `./do add`, which audits what the resolution brings in before anything is installed.';
const notAudited =
  'Running a package for one go is not audited. A tool worth having is a dependency added with `./do add`.';
const notPnpm = 'This repository is a pnpm shop: a dependency is added with `./do add`.';

// The pnpm subcommands that resolve something the lockfile does not hold.
const RESOLVING: Record<string, true> = {
  add: true,
  i: true,
  install: true,
  update: true,
  up: true,
  dlx: true,
};
const ONE_OFF: Record<string, true> = { npx: true, pnpx: true };
const OTHER_MANAGERS: Record<string, true> = { npm: true, yarn: true, bun: true };

const segments = (command: string): string[][] =>
  command
    .split(/(?:&&|\|\||[;&|])/)
    .map((segment) =>
      segment
        .trim()
        .split(/\s+/)
        .filter((word) => word !== '' && !/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)),
    )
    .filter((words) => words.length > 0);

// A manifest that differs from HEAD is one something was changed in by hand, so an
// install of it resolves whatever that names. A tree that is not a repository, or a
// git that is not there, cannot be asked, and is treated as differing.
const manifestMatchesHead = (cwd: string): boolean =>
  spawnSync('git', ['-C', cwd, 'diff', '--quiet', 'HEAD', '--', 'package.json'], {
    stdio: 'ignore',
  }).status === 0;

const refusal = (words: string[], cwd: string): string | undefined => {
  const program = words[0]?.split('/').pop() ?? '';
  if (Object.hasOwn(ONE_OFF, program)) return notAudited;
  if (Object.hasOwn(OTHER_MANAGERS, program)) return notPnpm;
  if (program !== 'pnpm') return undefined;

  const rest = words.slice(1);
  const subcommand = rest.find((word) => !word.startsWith('-')) ?? '';
  if (!Object.hasOwn(RESOLVING, subcommand)) return undefined;
  if (subcommand === 'dlx') return notAudited;

  if (subcommand === 'install' || subcommand === 'i') {
    const namesAPackage = rest.some((word) => !word.startsWith('-') && word !== subcommand);
    const frozen = rest.includes('--frozen-lockfile');
    if (!namesAPackage && (frozen || manifestMatchesHead(cwd))) return undefined;
  }

  return addThroughTheTask;
};

export default function refuseADirectAdd(pi: Extension): void {
  pi.on('tool_call', (event, context) => {
    if (event.toolName !== 'bash') return undefined;
    const command = event.input.command;
    if (typeof command !== 'string') return undefined;
    for (const words of segments(command)) {
      const reason = refusal(words, context.cwd);
      if (reason !== undefined) return { block: true, reason };
    }
    return undefined;
  });
}
