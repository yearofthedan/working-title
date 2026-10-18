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

describe('a git restore or checkout', () => {
  const dirty = repository({ dirty: ['notes.txt', 'plan/beats.md'] });
  const clean = repository();
  const untracked = repository({ untracked: ['fresh.txt'] });
  const twoC = repository();
  const throughTwoC = `git -C ${dirname(twoC)} -C ${basename(twoC)} restore notes.txt`;

  it.each([
    'git restore notes.txt',
    'git checkout notes.txt',
    'git restore plan',
    'git restore .',
    'git restore --worktree notes.txt',
    'git restore --staged --worktree notes.txt',
    'git restore -SW notes.txt',
    'git restore -- notes.txt',
    "git restore '*.txt'",
    'git restore :/',
  ])('refuses %s, which would overwrite a change', (command) => {
    expect(refused(command, dirty)).toBe(true);
  });

  it('refuses git restore behind -C into the repository holding the change', () => {
    expect(refused(`git -C ${dirty} restore notes.txt`, clean)).toBe(true);
  });

  it.each([
    ['git restore notes.txt', 'notes.txt'],
    ['git restore notes.txt plan/beats.md', 'plan/beats.md'],
  ])('names %s in the reason it gives', (command, path) => {
    expect(reasonFor(command, dirty)).toContain(path);
  });

  it.each([
    ['git restore --staged notes.txt', dirty],
    ['git status', dirty],
    ['git restore notes.txt', clean],
    ['git restore fresh.txt', untracked],
  ])('passes %s where the tree holds nothing for it', (command, cwd) => {
    expect(refused(command, cwd)).toBe(false);
  });

  it('passes git restore where two -C options lead to the repository', () => {
    expect(refused(throughTwoC, clean)).toBe(false);
  });
});

describe('a git push', () => {
  const clean = repository();
  const onMain = repository({ branch: 'main' });
  const onASpike = repository({ branch: 'spike' });
  const detached = repository();
  execFileSync('git', ['-C', detached, 'checkout', '-q', '--detach']);

  it.each([
    ['git push', onMain],
    ['git push', onASpike],
    ['git push origin main', clean],
    ['git push origin 74-another-line', clean],
    ['git push --force', clean],
    ['git push -f origin 73-fix-a-dodgy-restore', clean],
    ['git push --force-with-lease', clean],
    ['git push origin +73-fix-a-dodgy-restore', clean],
    ['git push --delete origin 73-fix-a-dodgy-restore', clean],
    ['git push --all', clean],
    ['git push --mirror', clean],
    ['git push', detached],
  ])('refuses %s', (command, cwd) => {
    expect(refused(command, cwd)).toBe(true);
  });

  it.each([
    ['git push origin main', 'main'],
    ['git push --delete origin 73-fix-a-dodgy-restore', 'removal is the builder'],
  ])('says why, for %s', (command, wanted) => {
    expect(reasonFor(command, clean)).toContain(wanted);
  });

  it.each([
    ['git push', clean],
    ['git push -u origin HEAD', clean],
    ['git push origin 73-fix-a-dodgy-restore', clean],
    ['git commit -m "stop: git push --force blocked"', clean],
  ])('passes %s', (command, cwd) => {
    expect(refused(command, cwd)).toBe(false);
  });
});

describe('gh pr ready', () => {
  const clean = repository();

  it.each(['gh pr ready 77', 'gh pr ready', 'git push && gh pr ready 77'])(
    'refuses %s',
    (command) => {
      expect(refused(command, clean)).toBe(true);
    },
  );

  it('names ./do ready', () => {
    expect(reasonFor('gh pr ready 77', clean)).toContain('./do ready');
  });

  it.each([
    'gh pr ready 77 --undo',
    './do ready 77',
    'gh pr view 77 --json body',
    'gh pr checks 77',
  ])('passes %s', (command) => {
    expect(refused(command, clean)).toBe(false);
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

describe('a tool call', () => {
  it('passes when it is not bash', () => {
    expect(handler()({ toolName: 'read', input: {} }, { cwd: repository() })).toBeUndefined();
  });
});
