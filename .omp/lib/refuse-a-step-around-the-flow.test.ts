import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import refuseAStepAroundTheFlow, { type Extension } from './refuse-a-step-around-the-flow';

type Handler = (
  event: { toolName: string; input: Record<string, unknown> },
  context: { cwd: string },
) => unknown;

const handler = (): Handler => {
  let registered: Handler | undefined;
  const pi: Extension = {
    on: (_event, next) => {
      registered = next as Handler;
    },
  };
  refuseAStepAroundTheFlow(pi);
  if (registered === undefined) throw new Error('the extension registered no handler');
  return registered;
};

type Tree = { branch?: string; dirty?: string[]; untracked?: string[] };

const repository = ({
  branch = '73-fix-a-dodgy-restore',
  dirty = [],
  untracked = [],
}: Tree = {}): string => {
  const dir = mkdtempSync(join(tmpdir(), 'refuse-a-step-around-the-flow-'));
  execFileSync('git', ['init', '-q', '-b', branch, dir]);
  writeFileSync(join(dir, 'notes.txt'), 'as committed\n');
  mkdirSync(join(dir, 'plan'), { recursive: true });
  writeFileSync(join(dir, 'plan/beats.md'), 'as committed\n');
  execFileSync('git', ['-C', dir, 'add', '-A']);
  execFileSync('git', [
    '-C',
    dir,
    '-c',
    'user.email=t@example.com',
    '-c',
    'user.name=t',
    'commit',
    '-qm',
    'base',
  ]);
  for (const path of dirty) writeFileSync(join(dir, path), 'a change not committed\n');
  for (const path of untracked) writeFileSync(join(dir, path), 'new\n');
  return dir;
};

// A branch that is there to switch to, one only on the remote, and a linked
// worktree to switch in, holding a change so a branch name is still left alone
// there while the tree is dirty.
const repositoryToSwitchIn = (): { main: string; linked: string } => {
  const main = repository();
  execFileSync('git', ['-C', main, 'branch', '73-another-line']);
  execFileSync('git', ['-C', main, 'update-ref', 'refs/remotes/origin/73-a-remote-line', 'HEAD']);
  const linked = `${main}-linked`;
  execFileSync('git', ['-C', main, 'worktree', 'add', '-q', linked, '-b', '73-a-linked-line']);
  writeFileSync(join(linked, 'notes.txt'), 'a change not committed\n');
  return { main, linked };
};

const refused = (command: string, cwd: string): boolean =>
  handler()({ toolName: 'bash', input: { command } }, { cwd }) !== undefined;

const reasonFor = (command: string, cwd: string): string =>
  (handler()({ toolName: 'bash', input: { command } }, { cwd }) as { reason?: string } | undefined)
    ?.reason ?? '';

describe('refuseAStepAroundTheFlow', () => {
  const dirty = repository({ dirty: ['notes.txt', 'plan/beats.md'] });
  const clean = repository();

  it('refuses git restore of a path with uncommitted changes', () => {
    expect(refused('git restore notes.txt', dirty)).toBe(true);
  });

  it('names the path it would overwrite', () => {
    expect(reasonFor('git restore notes.txt', dirty)).toContain('notes.txt');
  });

  it('names every path it would overwrite', () => {
    expect(reasonFor('git restore notes.txt plan/beats.md', dirty)).toContain('plan/beats.md');
  });

  it('refuses git checkout of a path with uncommitted changes', () => {
    expect(refused('git checkout notes.txt', dirty)).toBe(true);
  });

  it('refuses git restore of a directory holding a change', () => {
    expect(refused('git restore plan', dirty)).toBe(true);
  });

  it('refuses git restore of the whole tree', () => {
    expect(refused('git restore .', dirty)).toBe(true);
  });

  it('refuses git restore --worktree', () => {
    expect(refused('git restore --worktree notes.txt', dirty)).toBe(true);
  });

  it('refuses git restore --staged --worktree', () => {
    expect(refused('git restore --staged --worktree notes.txt', dirty)).toBe(true);
  });

  it('refuses git restore with the short flags combined', () => {
    expect(refused('git restore -SW notes.txt', dirty)).toBe(true);
  });

  it('refuses git restore behind a path to the repository', () => {
    expect(refused(`git -C ${dirty} restore notes.txt`, clean)).toBe(true);
  });

  it('refuses git restore of a path named after --', () => {
    expect(refused('git restore -- notes.txt', dirty)).toBe(true);
  });

  it('passes git restore --staged, which leaves the worktree alone', () => {
    expect(refused('git restore --staged notes.txt', dirty)).toBe(false);
  });

  it('passes git restore where the path matches HEAD', () => {
    expect(refused('git restore notes.txt', clean)).toBe(false);
  });

  it('passes git restore of an untracked file, which holds no committed work', () => {
    expect(refused('git restore fresh.txt', repository({ untracked: ['fresh.txt'] }))).toBe(false);
  });

  it('refuses git restore of a glob the shell would leave to git', () => {
    expect(refused("git restore '*.txt'", dirty)).toBe(true);
  });

  it('refuses git restore of the whole tree by pathspec magic', () => {
    expect(refused('git restore :/', dirty)).toBe(true);
  });

  it('passes git restore where two -C options lead to the repository', () => {
    const repo = repository();
    const elsewhere = `git -C ${dirname(repo)} -C ${basename(repo)} restore notes.txt`;
    expect(refused(elsewhere, clean)).toBe(false);
  });

  it('passes git status', () => {
    expect(refused('git status', dirty)).toBe(false);
  });

  it('passes git push on the story branch', () => {
    expect(refused('git push', clean)).toBe(false);
  });

  it('passes git push -u origin HEAD on the story branch', () => {
    expect(refused('git push -u origin HEAD', clean)).toBe(false);
  });

  it('passes git push naming the story branch', () => {
    expect(refused('git push origin 73-fix-a-dodgy-restore', clean)).toBe(false);
  });

  it('refuses git push on main', () => {
    expect(refused('git push', repository({ branch: 'main' }))).toBe(true);
  });

  it('refuses git push on a branch named for no issue', () => {
    expect(refused('git push', repository({ branch: 'spike' }))).toBe(true);
  });

  it('refuses git push naming main', () => {
    expect(refused('git push origin main', clean)).toBe(true);
  });

  it('says which branch it would push', () => {
    expect(reasonFor('git push origin main', clean)).toContain('main');
  });

  it('refuses git push naming another branch', () => {
    expect(refused('git push origin 74-another-line', clean)).toBe(true);
  });

  it('refuses git push --force', () => {
    expect(refused('git push --force', clean)).toBe(true);
  });

  it('refuses git push -f', () => {
    expect(refused('git push -f origin 73-fix-a-dodgy-restore', clean)).toBe(true);
  });

  it('refuses git push --force-with-lease', () => {
    expect(refused('git push --force-with-lease', clean)).toBe(true);
  });

  it('refuses git push with a forced refspec', () => {
    expect(refused('git push origin +73-fix-a-dodgy-restore', clean)).toBe(true);
  });

  it('refuses git push --delete', () => {
    expect(refused('git push --delete origin 73-fix-a-dodgy-restore', clean)).toBe(true);
  });

  it("says a removal is the builder's call, since a push adds to its branch", () => {
    expect(reasonFor('git push --delete origin 73-fix-a-dodgy-restore', clean)).toContain(
      'removal is the builder',
    );
  });

  it('refuses git push --all', () => {
    expect(refused('git push --all', clean)).toBe(true);
  });

  it('refuses git push --mirror', () => {
    expect(refused('git push --mirror', clean)).toBe(true);
  });

  it('refuses git push on a detached head', () => {
    const detached = repository();
    execFileSync('git', ['-C', detached, 'checkout', '-q', '--detach']);
    expect(refused('git push', detached)).toBe(true);
  });

  it('passes a command whose quoted argument mentions a refused push', () => {
    expect(refused('git commit -m "stop: git push --force blocked"', clean)).toBe(false);
  });

  it('passes a tool call that is not bash', () => {
    expect(handler()({ toolName: 'read', input: {} }, { cwd: clean })).toBeUndefined();
  });

  it('refuses gh pr ready', () => {
    expect(refused('gh pr ready 77', clean)).toBe(true);
  });

  it('refuses gh pr ready with no pull request named', () => {
    expect(refused('gh pr ready', clean)).toBe(true);
  });

  it('refuses gh pr ready behind another command', () => {
    expect(refused('git push && gh pr ready 77', clean)).toBe(true);
  });

  it('names ./do ready', () => {
    expect(reasonFor('gh pr ready 77', clean)).toContain('./do ready');
  });

  it('passes gh pr ready --undo, which marks nothing ready', () => {
    expect(refused('gh pr ready 77 --undo', clean)).toBe(false);
  });

  it('passes ./do ready', () => {
    expect(refused('./do ready 77', clean)).toBe(false);
  });

  it('passes gh pr view', () => {
    expect(refused('gh pr view 77 --json body', clean)).toBe(false);
  });

  it('passes gh pr checks', () => {
    expect(refused('gh pr checks 77', clean)).toBe(false);
  });
});

describe('a branch switch', () => {
  const { main, linked } = repositoryToSwitchIn();

  it.each([
    'git switch 73-another-line',
    'git switch -c 73-new',
    // `-` names the branch before this one.
    'git switch -',
    'git checkout 73-another-line',
    'git checkout -',
    // A branch only on the remote, which git makes a local branch of and switches to.
    'git checkout 73-a-remote-line',
    'git checkout -b 73-new',
    'git checkout --detach 73-another-line',
  ])('refuses %s in the main worktree', (command) => {
    expect(refused(command, main)).toBe(true);
  });

  it('names the worktree the line starts in', () => {
    expect(reasonFor('git switch 73-another-line', main)).toContain('git worktree add');
  });

  it.each([
    'git switch 73-another-line',
    'git checkout 73-another-line',
    'git checkout -b 73-new',
    'git checkout 73-a-remote-line',
  ])('passes %s in a linked worktree', (command) => {
    expect(refused(command, linked)).toBe(false);
  });

  it.each([
    // The way in.
    'git worktree add ../73-new -b 73-new origin/main',
    // A restore, which line 1's rule reads and leaves alone on a clean tree.
    'git checkout notes.txt',
    'git checkout -- notes.txt',
    'git checkout HEAD -- notes.txt',
    // Neither switches.
    'git switch --help',
  ])('passes %s in the main worktree', (command) => {
    expect(refused(command, main)).toBe(false);
  });

  it('passes behind -C, read against the worktree it names', () => {
    expect(refused(`git -C ${linked} switch 73-another-line`, main)).toBe(false);
  });
});
