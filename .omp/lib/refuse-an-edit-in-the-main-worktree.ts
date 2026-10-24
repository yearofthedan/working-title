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

const URL_SCHEME = /^(?!file:\/\/)[a-z][a-z0-9+.-]*:\/\//i;

const git = (cwd: string, args: string[]): { failed: boolean; out: string } => {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
  return { failed: result.status !== 0, out: result.stdout ?? '' };
};

const isMainWorktree = (cwd: string): boolean => {
  const paths = git(cwd, ['rev-parse', '--path-format=absolute', '--git-dir', '--git-common-dir']);
  const [directory, common] = paths.out.trim().split('\n');
  return !paths.failed && directory !== undefined && directory === common;
};

const nearestDirectory = (path: string): string => {
  let at = existsSync(path) && statSync(path).isDirectory() ? path : dirname(path);
  while (!existsSync(at)) {
    const parent = dirname(at);
    if (parent === at) return at;
    at = parent;
  }
  return at;
};

const ignoredByGit = (cwd: string, path: string): boolean =>
  !git(cwd, ['check-ignore', '-q', '--', path]).failed;

const landsInTheMainWorktree = (path: string): boolean => {
  const directory = nearestDirectory(path);
  return isMainWorktree(directory) && !ignoredByGit(directory, path);
};

const pathsOf = (input: Record<string, unknown>): string[] => {
  const { path, paths } = input;
  if (Array.isArray(paths) && paths.every((it) => typeof it === 'string')) return paths;
  return typeof path === 'string' ? [path] : [];
};

const moveDestinations = (input: Record<string, unknown>): string[] =>
  typeof input.input === 'string'
    ? [...input.input.matchAll(/^[ \t]*MV(?:[ \t]*:[ \t]*|[ \t]+)(\S.*?)[ \t]*$/gm)].map(
        ([, destination]) => destination.replace(/^(["'])(.*)\1$/, '$2'),
      )
    : [];

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
