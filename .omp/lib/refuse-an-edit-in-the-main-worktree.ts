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

// A path that names an internal URL, such as `local://notes.md`, is not one on disk.
const URL_SCHEME = /^[a-z][a-z0-9+.-]*:\/\//i;

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

// `edit` carries the paths it reads and writes as `paths`, a `write` the one it
// writes as `path`. The hooks doc says only that `input` is the normalized arguments
// ([hooks](https://github.com/can1357/oh-my-pi/blob/main/docs/hooks.md)); these two
// shapes are what a logging hook saw in OMP 18.11.3.
const pathsOf = (input: Record<string, unknown>): string[] => {
  const { path, paths } = input;
  if (Array.isArray(paths) && paths.every((it) => typeof it === 'string')) return paths;
  return typeof path === 'string' ? [path] : [];
};

export default function refuseAnEditInTheMainWorktree(pi: Extension): void {
  pi.on('tool_call', (event, context) => {
    if (event.toolName !== 'edit' && event.toolName !== 'write') return undefined;
    // shortcut: a forked, branched or lease-moved main session also carries parentSession (omp://session.md, "parentSession is an opaque lineage string"), so it is refused too; read a documented subagent flag if OMP adds one.
    const parentSession = context.sessionManager?.getHeader?.()?.parentSession;
    if (typeof parentSession !== 'string' || parentSession === '') return undefined;
    const refused = pathsOf(event.input)
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
