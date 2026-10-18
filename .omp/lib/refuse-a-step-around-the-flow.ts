// Refuse a git step that would discard uncommitted work, or push off the story branch.

import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
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

// A line's branch names its issue, as the implement skill names it.
const STORY_BRANCH = /^[0-9]+-/;

const GIT_OPTIONS_THAT_TAKE_A_VALUE: Record<string, true> = {
  '-c': true,
  '--config-env': true,
  '--git-dir': true,
  '--work-tree': true,
  '--namespace': true,
  '--exec-path': true,
};
const PUSH_OPTIONS_THAT_TAKE_A_VALUE: Record<string, true> = {
  '-o': true,
  '--push-option': true,
  '--repo': true,
  '--receive-pack': true,
  '--exec': true,
};
const FORCE_FLAGS: Record<string, true> = {
  '--force': true,
  '--force-with-lease': true,
  '--force-if-includes': true,
};
// What lets a push move or rewrite what the remote carries, each with the note
// that a refspec's `+` forces the update too
// ([git-push](https://git-scm.com/docs/git-push)).
const PUSHES_OTHER_REFS: Record<string, true> = {
  '--all': true,
  '--mirror': true,
  '--tags': true,
};
const REMOVES_A_REF: Record<string, true> = { '--delete': true, '-d': true };

const git = (cwd: string, args: string[]): { failed: boolean; out: string } => {
  const result = spawnSync('git', ['-C', cwd, ...args], { encoding: 'utf8' });
  return { failed: result.status !== 0, out: result.stdout ?? '' };
};

const currentBranch = (cwd: string): string | undefined => {
  const branch = git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
  const name = branch.out.trim();
  return branch.failed || name === '' || name === 'HEAD' ? undefined : name;
};

const gitInvocation = (
  words: string[],
  cwd: string,
): { subcommand: string; args: string[]; cwd: string } | undefined => {
  let dir = cwd;
  let index = 1;
  while (index < words.length) {
    const word = words[index] ?? '';
    if (word === '-C') {
      const next = words[index + 1];
      if (next === undefined) return undefined;
      dir = resolve(dir, next);
      index += 2;
      continue;
    }
    if (Object.hasOwn(GIT_OPTIONS_THAT_TAKE_A_VALUE, word)) {
      index += 2;
      continue;
    }
    if (word.startsWith('-')) {
      index += 1;
      continue;
    }
    return { subcommand: word, args: words.slice(index + 1), cwd: dir };
  }
  return undefined;
};

// A path git reports as modified or staged is work this step would destroy.
// Untracked and ignored paths are not: only tracked paths are restored
// ([git-restore](https://git-scm.com/docs/git-restore)).
const holdsUncommittedWork = (cwd: string, path: string): boolean => {
  const status = git(cwd, ['status', '--porcelain', '--', path]);
  // A tree git cannot be asked about is treated as holding work.
  if (status.failed) return true;
  return status.out
    .split('\n')
    .some((line) => line.trim() !== '' && !line.startsWith('??') && !line.startsWith('!!'));
};

const overwriteRefusal = (subcommand: string, args: string[], cwd: string): string | undefined => {
  const named: string[] = [];
  let worktree = subcommand === 'checkout';
  let staged = false;
  for (let index = 0; index < args.length; index += 1) {
    const word = args[index] ?? '';
    if (word === '--') {
      named.push(...args.slice(index + 1));
      break;
    }
    if (word.startsWith('-')) {
      const bundle = word.startsWith('--') ? '' : word.slice(1);
      staged = staged || word === '--staged' || bundle.includes('S');
      worktree = worktree || word === '--worktree' || bundle.includes('W');
      continue;
    }
    named.push(word);
  }
  // With neither -W nor -S the working tree is restored; -S alone leaves it
  // ([git-restore](https://git-scm.com/docs/git-restore)).
  if (!worktree && staged) return undefined;
  // A word that names no path reports nothing, so a branch name among the words
  // is left alone; a glob or `:/` is matched by git, as the shell or git would.
  const dirty = named.filter((path) => holdsUncommittedWork(cwd, path));
  if (dirty.length === 0) return undefined;
  const names = dirty.map((path) => `\`${path}\``).join(', ');
  return `${names} ${dirty.length === 1 ? 'has' : 'have'} uncommitted changes that \`git ${subcommand}\` would overwrite. Commit them first, or ask the builder.`;
};

// What moves HEAD: switch itself, and the flags that name a branch to create or
// detach onto ([git-switch](https://git-scm.com/docs/git-switch),
// [git-checkout](https://git-scm.com/docs/git-checkout)).
const SWITCH_FLAGS: Record<string, true> = {
  '-b': true,
  '-B': true,
  '-c': true,
  '-C': true,
  '--orphan': true,
  '--detach': true,
};

// A linked worktree keeps its git directory apart from the common one, so the two
// paths matching is what says this is the one the builder shares
// ([git-worktree](https://git-scm.com/docs/git-worktree)).
const isMainWorktree = (cwd: string): boolean => {
  const paths = git(cwd, ['rev-parse', '--path-format=absolute', '--git-dir', '--git-common-dir']);
  const [directory, common] = paths.out.trim().split('\n');
  return !paths.failed && directory !== undefined && directory === common;
};

// A word names a branch when it resolves as a commit, or when a remote branch of
// that name is the only one, which git switches to by making a local branch of it
// ([git-checkout](https://git-scm.com/docs/git-checkout)).
const namesABranch = (cwd: string, word: string): boolean =>
  !git(cwd, ['rev-parse', '--verify', '-q', `${word}^{commit}`]).failed ||
  git(cwd, ['for-each-ref', '--count=1', `refs/remotes/*/${word}`]).out.trim() !== '';

const switchRefusal = (subcommand: string, args: string[], cwd: string): string | undefined => {
  if (args.includes('--help') || args.includes('-h')) return undefined;
  // A `--` says the words after it are paths, which restores files from a version
  // and leaves HEAD where it is, so no word there is read for a branch.
  const words = args.includes('--') ? [] : args;
  const switches =
    subcommand === 'switch' ||
    words.some((word) => word === '-' || Object.hasOwn(SWITCH_FLAGS, word)) ||
    words.some((word) => !word.startsWith('-') && namesABranch(cwd, word));
  if (!switches) return undefined;
  if (!isMainWorktree(cwd)) return undefined;
  return 'This is the main worktree, which the builder and other sessions share: a branch switch here moves their work. Start the line in a worktree of its own: `git worktree add ../<branch> -b <branch> origin/main`.';
};

const gitReason = (subcommand: string, args: string[], cwd: string): string | undefined => {
  if (subcommand === 'switch') return switchRefusal(subcommand, args, cwd);
  if (subcommand === 'checkout') {
    return switchRefusal(subcommand, args, cwd) ?? overwriteRefusal(subcommand, args, cwd);
  }
  if (subcommand === 'restore') return overwriteRefusal(subcommand, args, cwd);
  if (subcommand === 'push') return pushRefusal(args, cwd);
  return undefined;
};

const targetOf = (refspec: string, current: string | undefined): string | undefined => {
  const [source = '', destination] = refspec.replace(/^\+/, '').split(':');
  const branch = (destination === undefined ? source : destination).replace(/^refs\/heads\//, '');
  if (branch === '') return undefined;
  return branch === 'HEAD' ? current : branch;
};

const pushRefusal = (args: string[], cwd: string): string | undefined => {
  const positionals: string[] = [];
  let forced = false;
  let otherRefs = '';
  let removal = '';
  for (let index = 0; index < args.length; index += 1) {
    const word = args[index] ?? '';
    if (word === '--') {
      positionals.push(...args.slice(index + 1));
      break;
    }
    if (Object.hasOwn(PUSH_OPTIONS_THAT_TAKE_A_VALUE, word)) {
      index += 1;
      continue;
    }
    const flag = word.split('=')[0] ?? '';
    if (Object.hasOwn(FORCE_FLAGS, flag)) forced = true;
    if (Object.hasOwn(PUSHES_OTHER_REFS, flag)) otherRefs = flag;
    if (Object.hasOwn(REMOVES_A_REF, flag)) removal = flag;
    const short = word.startsWith('-') && !word.startsWith('--') ? word.slice(1) : '';
    if (short !== '') {
      if (short.includes('f')) forced = true;
      if (short.includes('d')) removal = '-d';
    }
    if (word.startsWith(':')) removal = '--delete';
    if (word.startsWith('+')) forced = true;
    if (!word.startsWith('-')) positionals.push(word);
  }
  if (removal !== '') {
    return `\`${removal}\` removes a ref on the remote. A push adds to the story branch; a removal is the builder's call.`;
  }
  if (otherRefs !== '') {
    return `\`${otherRefs}\` moves refs beyond the story branch. A push carries the current branch alone.`;
  }
  if (forced) {
    return "A push goes without force: rewriting what the remote carries is the builder's call, not a step to slip in.";
  }
  const current = currentBranch(cwd);
  const asked = positionals.slice(1);
  const targets = asked.length === 0 ? [current] : asked.map((it) => targetOf(it, current));
  const elsewhere = targets.find((target) => target !== current);
  if (current !== undefined && STORY_BRANCH.test(current) && elsewhere === undefined)
    return undefined;
  const would = targets[0] === undefined ? 'no branch' : `\`${targets[0]}\``;
  return `A push goes only to the story branch, named \`<issue number>-…\`, without force. This one would push ${would}.`;
};

export default function refuseAStepAroundTheFlow(pi: Extension): void {
  pi.on('tool_call', (event, context) => {
    if (event.toolName !== 'bash') return undefined;
    const command = event.input.command;
    if (typeof command !== 'string') return undefined;
    for (const words of wordsPerCommand(command)) {
      if ((words[0]?.split('/').pop() ?? '') !== 'git') continue;
      const invocation = gitInvocation(words, context.cwd);
      if (invocation === undefined) continue;
      const { subcommand, args, cwd } = invocation;
      const reason = gitReason(subcommand, args, cwd);
      if (reason !== undefined) return { block: true, reason };
    }
    return undefined;
  });
}
