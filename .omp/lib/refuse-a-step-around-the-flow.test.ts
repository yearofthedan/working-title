import { execFileSync } from 'node:child_process';
import { chmodSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
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

type Tree = {
  branch?: string;
  dirty?: string[];
  untracked?: string[];
  preCommit?: 'installed' | 'missing' | 'not executable';
  hooksPath?: string;
};

const repository = ({
  branch = '73-fix-a-dodgy-restore',
  dirty = [],
  untracked = [],
  preCommit = 'installed',
  hooksPath,
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
  const hooks = join(dir, hooksPath ?? '.git/hooks');
  if (hooksPath !== undefined)
    execFileSync('git', ['-C', dir, 'config', 'core.hooksPath', hooksPath]);
  if (preCommit !== 'missing') {
    mkdirSync(hooks, { recursive: true });
    const hook = join(hooks, 'pre-commit');
    writeFileSync(hook, '#!/bin/sh\nexit 0\n');
    chmodSync(hook, preCommit === 'installed' ? 0o755 : 0o644);
  }
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

// `cwd` is the session's; `callCwd` is the directory the call itself names, which
// the harness hands the hook in the tool input.
const refused = (command: string, cwd: string, callCwd?: string): boolean =>
  handler()(
    { toolName: 'bash', input: callCwd === undefined ? { command } : { command, cwd: callCwd } },
    { cwd },
  ) !== undefined;

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
    // The empty target of the first command leaves no word to drop, so the push
    // after the `;` is still read as the command it is.
    ['echo hi > "" ; git push --force origin main', clean],
    // The drop stops at the redirection's own target, so the push's arguments are read.
    ['git push 2>/dev/null --force origin main', clean],
    ['GIT_TRACE=1 git push --force origin main', clean],
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

  // A redirection belongs to the shell, so what follows the push is not a refspec.
  it.each([
    'git push -u origin HEAD 2>&1',
    'git push -u origin HEAD 2>&1 | tail -3',
    `git -C ${clean} push -u origin HEAD 2>&1 | tail -3`,
    'git push -u origin HEAD > "a log file"',
    // Ancillary to `--force-with-lease`, which is refused: alone it is a no-op
    // ([git-push](https://git-scm.com/docs/git-push)).
    'git push --force-if-includes',
  ])('passes %s', (command) => {
    expect(refused(command, clean)).toBe(false);
  });
});

describe('the directory the call runs in', () => {
  const main = repository({ branch: 'main' });
  const linked = `${main}-linked`;
  execFileSync('git', ['-C', main, 'worktree', 'add', '-q', linked, '-b', '73-a-linked-line']);

  it('passes a push from the worktree the call names, not the session', () => {
    expect(refused('git push -u origin HEAD', main, linked)).toBe(false);
  });

  it('refuses a push on the branch of the worktree the call names', () => {
    expect(refused('git push -u origin HEAD', linked, main)).toBe(true);
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

  it('names the worktree the planned pull request starts in', () => {
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

describe('a git commit', () => {
  const clean = repository();

  it.each([
    'git commit --no-verify -m "72: a change"',
    'git commit -n -m "72: a change"',
    'git commit -anm "72: a change"',
    'git commit -m "72: a change" --no-verify',
    'git add -A && git commit -n -m "72: a change"',
    `git -C ${clean} commit --no-verify -m "72: a change"`,
    'git commit --no-veri -m "72: a change"',
    'git commit --no-verif -m "72: a change"',
    'DISABLE_MODEL_CHECK=1 git commit -n -m "72: a change"',
    'VP_GIT_HOOKS=0 git commit -m "72: a change"',
    'HUSKY=0 git commit -m "72: a change"',
    'env VITE_GIT_HOOKS=0 git commit -m "72: a change"',
  ])('refuses %s', (command) => {
    expect(refused(command, clean)).toBe(true);
  });

  it('names the checks it would skip', () => {
    expect(reasonFor('git commit -n -m "72: a change"', clean)).toContain('./do check');
  });

  it('reads the hook from where core.hooksPath points, not .git/hooks', () => {
    const elsewhere = repository({ preCommit: 'missing', hooksPath: '.vite-hooks/_' });
    writeFileSync(join(elsewhere, '.git/hooks/pre-commit'), '#!/bin/sh\nexit 0\n');
    chmodSync(join(elsewhere, '.git/hooks/pre-commit'), 0o755);
    expect(refused('git commit -m "72: a change"', elsewhere)).toBe(true);
    expect(
      refused('git commit -m "72: a change"', repository({ hooksPath: '.vite-hooks/_' })),
    ).toBe(false);
  });

  it.each([
    ['missing', repository({ preCommit: 'missing' })],
    ['not executable', repository({ preCommit: 'not executable' })],
  ] as const)('refuses a commit where the pre-commit hook is %s', (_, cwd) => {
    expect(refused('git commit -m "72: a change"', cwd)).toBe(true);
  });

  it('names pnpm install where the pre-commit hook is missing', () => {
    expect(
      reasonFor('git commit -m "72: a change"', repository({ preCommit: 'missing' })),
    ).toContain('pnpm install');
  });

  it('reads the hook from the worktree -C names', () => {
    const missing = repository({ preCommit: 'missing' });
    expect(refused(`git -C ${missing} commit -m "72: a change"`, clean)).toBe(true);
    expect(refused(`git -C ${clean} commit -m "72: a change"`, missing)).toBe(false);
  });

  it.each([
    'git commit -m "72: a change"',
    'git commit -am "72: a change"',
    'git commit -mn',
    'git commit -m "72: refuse --no-verify"',
    'git commit -uno -m "72: a change"',
    "git commit --allow-empty -m '72: a title' --trailer 'Agent-Model: x'",
    'DISABLE_MODEL_CHECK=1 git commit -m "72: a change"',
    'git commit --no-verbose -m "72: a change"',
    'VP_GIT_HOOKS=1 git commit -m "72: a change"',
  ])('passes %s', (command) => {
    expect(refused(command, clean)).toBe(false);
  });
});

describe('a tool call', () => {
  it('passes when it is not bash', () => {
    expect(handler()({ toolName: 'read', input: {} }, { cwd: repository() })).toBeUndefined();
  });
});
