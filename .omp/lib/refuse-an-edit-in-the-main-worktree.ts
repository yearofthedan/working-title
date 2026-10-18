// Refuse an edit or a write that lands in the main worktree, which the builder
// and other sessions share.

import { spawnSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { dirname } from 'node:path';
import { resolveCallCwd } from './call-cwd';

type ToolCall = { toolName: string; input: Record<string, unknown> };
type SessionHeader = { parentSession?: unknown };
type Context = {
  cwd: string;
  sessionManager?: { getHeader?: () => SessionHeader | undefined };
};
type ToolCallResult = { block: true; reason: string } | undefined;

export type Extension = {
  on(
    event: 'tool_call',
    handler: (event: ToolCall, context: Context) => ToolCallResult | Promise<ToolCallResult>,
  ): void;
};

// An internal URL other than a `file://` one, such as `local://notes.md`, is not a
// path on disk; `resolveCallCwd` reads a `file://` one as the path it names.
const URL_SCHEME = /^(?!file:\/\/)[a-z][a-z0-9+.-]*:\/\//i;

const git = (cwd: string, args: string[]): { failed: boolean; out: string } => {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
  return { failed: result.status !== 0, out: result.stdout ?? '' };
};

// A linked worktree keeps its git directory apart from the common one, so the two
// paths matching is what says this is the one the builder shares
// ([git-worktree](https://git-scm.com/docs/git-worktree)).
const isMainWorktree = (cwd: string): boolean => {
  const paths = git(cwd, ['rev-parse', '--path-format=absolute', '--git-dir', '--git-common-dir']);
  const [directory, common] = paths.out.trim().split('\n');
  return !paths.failed && directory !== undefined && directory === common;
};

// A call that writes a file names a path that may not be there yet, so the question
// is put to the nearest directory that is.
const nearestDirectory = (path: string): string => {
  let at = existsSync(path) && statSync(path).isDirectory() ? path : dirname(path);
  while (!existsSync(at)) {
    const parent = dirname(at);
    if (parent === at) return at;
    at = parent;
  }
  return at;
};

// A path git reports as ignored is the builder's to write in the main worktree; one
// it does not report is not, tracked or not
// ([git-check-ignore](https://git-scm.com/docs/git-check-ignore)).
const ignoredByGit = (cwd: string, path: string): boolean =>
  !git(cwd, ['check-ignore', '-q', '--', path]).failed;

const landsInTheMainWorktree = (path: string): boolean => {
  const directory = nearestDirectory(path);
  return isMainWorktree(directory) && !ignoredByGit(directory, path);
};

// An `edit` event carries derived `path`/`paths` fields for policy inspection
// ([hooks](https://github.com/can1357/oh-my-pi/blob/main/docs/hooks.md), "Event surfaces"):
// `paths` in hashline mode, `path` alone in a mode with one target. A `write` names
// its target as `path`.
const pathsOf = (input: Record<string, unknown>): string[] => {
  const { path, paths } = input;
  if (Array.isArray(paths) && paths.every((it) => typeof it === 'string')) return paths;
  return typeof path === 'string' ? [path] : [];
};

// An `edit` can move the file it edits: a `MV DEST` line of the hashline text names a
// destination that is not among the paths, and a destination with spaces is quoted
// ([edit](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/edit.md), "Canonical patch language").
const moveDestinations = (input: Record<string, unknown>): string[] =>
  typeof input.input === 'string'
    ? [...input.input.matchAll(/^MV\s+(.+)$/gm)].map(([, destination]) =>
        destination.replace(/^"(.*)"$/, '$1'),
      )
    : [];

// A path can be pasted from a read header, `[path#TAG]`, which the tools unwrap before
// use, so the hook reads the same path
// ([write](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/write.md), "Inputs").
const unwrapped = (path: string): string => /^\[(.+?)(#[0-9A-Fa-f]{4})?\]$/.exec(path)?.[1] ?? path;

export default function refuseAnEditInTheMainWorktree(pi: Extension): void {
  pi.on('tool_call', (event, context) => {
    if (event.toolName !== 'edit' && event.toolName !== 'write') return undefined;
    // shortcut: parentSession is not documented as a subagent flag (omp://session.md, "parentSession is an opaque lineage string"). A forked, branched or lease-moved main session carries it too, so it is refused; a subagent run in memory, with no session file, does not, so it passes. Read a documented subagent flag if OMP adds one.
    const parentSession = context.sessionManager?.getHeader?.()?.parentSession;
    if (typeof parentSession !== 'string' || parentSession === '') return undefined;
    const refused = [...pathsOf(event.input), ...moveDestinations(event.input)]
      .map(unwrapped)
      .filter((path) => !URL_SCHEME.test(path))
      .map((path) => resolveCallCwd(path, context.cwd))
      .filter(landsInTheMainWorktree);
    if (refused.length === 0) return undefined;
    const names = refused.map((path) => `\`${path}\``).join(', ');
    return {
      block: true,
      reason: `${names} ${refused.length === 1 ? 'is' : 'are'} in the main worktree, which the builder and other sessions share. Give the path absolute, under the worktree your dispatch names.`,
    };
  });
}
