// Refuse a shell command that would resolve a package without the audit ./do add runs.

import { spawnSync } from 'node:child_process';
import { wordsPerCommand } from './shell-words';

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

const RESOLVES_SOMETHING_NEW: Record<string, true> = {
  add: true,
  i: true,
  install: true,
  update: true,
  up: true,
  dlx: true,
};
const ONE_OFF_RUNNERS: Record<string, true> = { npx: true, pnpx: true };
const OTHER_PACKAGE_MANAGERS: Record<string, true> = { npm: true, yarn: true, bun: true };
// An option that takes a value and is not listed here reads as a package, which
// refuses an install that would have passed.
const OPTIONS_THAT_TAKE_A_VALUE: Record<string, true> = {
  '-C': true,
  '--dir': true,
  '-F': true,
  '--filter': true,
};

// A tree git cannot be asked about is treated as differing.
const manifestMatchesHead = (cwd: string): boolean => {
  const status = spawnSync('git', ['-C', cwd, 'status', '--porcelain', '--', '*package.json'], {
    encoding: 'utf8',
  });
  return status.status === 0 && status.stdout.trim() === '';
};

const namesAPackage = (rest: string[], subcommand: string): boolean => {
  for (let index = 0; index < rest.length; index += 1) {
    const word = rest[index] ?? '';
    if (word === subcommand) continue;
    if (Object.hasOwn(OPTIONS_THAT_TAKE_A_VALUE, word)) {
      index += 1;
      continue;
    }
    if (!word.startsWith('-')) return true;
  }
  return false;
};

const refusal = (words: string[], cwd: string): string | undefined => {
  const program = words[0]?.split('/').pop() ?? '';
  if (Object.hasOwn(ONE_OFF_RUNNERS, program)) return notAudited;
  if (Object.hasOwn(OTHER_PACKAGE_MANAGERS, program)) return notPnpm;
  if (program !== 'pnpm') return undefined;

  const rest = words.slice(1);
  const subcommand = rest.find((word) => Object.hasOwn(RESOLVES_SOMETHING_NEW, word));
  if (subcommand === undefined) return undefined;
  if (subcommand === 'dlx') return notAudited;

  if (subcommand === 'install' || subcommand === 'i') {
    if (rest.includes('--frozen-lockfile')) return undefined;
    if (!namesAPackage(rest, subcommand) && manifestMatchesHead(cwd)) return undefined;
  }

  return addThroughTheTask;
};

export default function refuseADirectAdd(pi: Extension): void {
  pi.on('tool_call', (event, context) => {
    if (event.toolName !== 'bash') return undefined;
    const command = event.input.command;
    if (typeof command !== 'string') return undefined;
    for (const words of wordsPerCommand(command)) {
      const reason = refusal(words, context.cwd);
      if (reason !== undefined) return { block: true, reason };
    }
    return undefined;
  });
}
