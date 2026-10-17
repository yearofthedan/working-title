// This repository is a pnpm shop, and a dependency is added with `./do add`, which
// resolves the candidate in a scratch copy and audits what it brings in before
// anything is installed. This refuses the commands that would resolve a package
// without that audit, so its code never runs here.
//
// The command is read the way a shell reads it, near enough: quoted text stays one
// word, and a separator inside it does not start a new command. Substitution and
// escapes are not read, so `sh -c 'pnpm add x'` is not caught. It is a default, not
// a boundary.

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
// The options whose next word is a value rather than a package. One that is not
// listed here reads as a package, which refuses an install that would have passed:
// the safe direction for a default.
const TAKES_A_VALUE: Record<string, true> = {
  '-C': true,
  '--dir': true,
  '-F': true,
  '--filter': true,
};

const segments = (command: string): string[][] => {
  const found: string[][] = [];
  let words: string[] = [];
  let word = '';
  let quote = '';
  const endWord = () => {
    if (word !== '') words.push(word);
    word = '';
  };
  const endSegment = () => {
    endWord();
    if (words.length > 0) found.push(words);
    words = [];
  };
  for (const character of command) {
    if (quote !== '') {
      if (character === quote) quote = '';
      else word += character;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '&' || character === '|' || character === ';') {
      endSegment();
    } else if (/\s/.test(character)) {
      endWord();
    } else {
      word += character;
    }
  }
  endSegment();
  return found;
};

// A manifest the last commit does not hold — edited, added, or in a directory of its
// own — is one an install of it resolves. A change already committed is not visible
// here, and the pull request's `./do audit` is what catches that. A tree git cannot
// be asked about is treated as differing.
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
    if (Object.hasOwn(TAKES_A_VALUE, word)) {
      index += 1;
      continue;
    }
    if (!word.startsWith('-')) return true;
  }
  return false;
};

const refusal = (words: string[], cwd: string): string | undefined => {
  const program = words[0]?.split('/').pop() ?? '';
  if (Object.hasOwn(ONE_OFF, program)) return notAudited;
  if (Object.hasOwn(OTHER_MANAGERS, program)) return notPnpm;
  if (program !== 'pnpm') return undefined;

  // The subcommand is looked for rather than read off the front, since an option
  // and its value may stand in front of it: `pnpm -C packages/x add lodash`.
  const rest = words.slice(1);
  const subcommand = rest.find((word) => Object.hasOwn(RESOLVING, word));
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
    for (const words of segments(command)) {
      const reason = refusal(words, context.cwd);
      if (reason !== undefined) return { block: true, reason };
    }
    return undefined;
  });
}
