import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import refuseAnEditInTheMainWorktree, {
  type Extension,
} from './refuse-an-edit-in-the-main-worktree';

type Call = { toolName: string; input: Record<string, unknown> };
type Session = {
  cwd: string;
  sessionManager: { getHeader: () => { parentSession?: unknown } };
};

type Handler = (event: Call, context: Session) => unknown;

const handler = (): Handler => {
  let registered: Handler | undefined;
  const pi: Extension = {
    on: (_event, next) => {
      registered = next as Handler;
    },
  };
  refuseAnEditInTheMainWorktree(pi);
  if (registered === undefined) throw new Error('the extension registered no handler');
  return registered;
};

// What a logging hook saw in OMP 18.11.3: a subagent's header names the session it
// came from as `parentSession`, and the main session's has none.
const subagent = { getHeader: () => ({ parentSession: '/some/parent.jsonl' }) };
const mainSession = { getHeader: () => ({}) };

const repository = (): { main: string; linked: string } => {
  const main = mkdtempSync(join(tmpdir(), 'refuse-an-edit-in-the-main-worktree-'));
  execFileSync('git', ['init', '-q', '-b', '75-a-line', main]);
  writeFileSync(join(main, '.gitignore'), 'ignored/\n');
  writeFileSync(join(main, 'notes.txt'), 'as committed\n');
  mkdirSync(join(main, 'ignored'), { recursive: true });
  writeFileSync(join(main, 'ignored/notes.md'), 'kept out of git\n');
  execFileSync('git', ['-C', main, 'add', '-A']);
  execFileSync('git', [
    '-C',
    main,
    '-c',
    'user.email=t@example.com',
    '-c',
    'user.name=t',
    'commit',
    '-qm',
    'base',
  ]);
  const linked = `${main}-linked`;
  execFileSync('git', ['-C', main, 'worktree', 'add', '-q', linked, '-b', '75-another-line']);
  return { main, linked };
};

const aWrite = (path: string): Call => ({ toolName: 'write', input: { path, content: 'hi' } });

const anEdit = (...paths: string[]): Call => ({
  toolName: 'edit',
  input: { input: paths[0] ?? '', path: paths[0] ?? '', paths },
});

// The hashline text an `edit` carries in `input`, which names a move's destination
// ([edit](https://github.com/can1357/oh-my-pi/blob/main/docs/tools/edit.md), "Canonical patch language").
const anEditOf = (input: string, ...paths: string[]): Call => ({
  toolName: 'edit',
  input: { input, path: paths[0] ?? '', paths },
});

const refused = (event: Call, session: Session): boolean => handler()(event, session) !== undefined;

const reasonFor = (event: Call, session: Session): string =>
  (handler()(event, session) as { reason?: string } | undefined)?.reason ?? '';

describe('an edit or a write in a subagent', () => {
  const { main, linked } = repository();
  const outside = join(mkdtempSync(join(tmpdir(), 'not-a-repository-')), 'notes.md');
  // Each case: what it is, the call, the session's directory, the path it must name.
  const mainCases: [string, Call, string, string][] = [
    ['a relative write in the main worktree', aWrite('notes.txt'), main, join(main, 'notes.txt')],
    [
      'a relative write of a file not yet on disk',
      aWrite('plan/beats.md'),
      main,
      join(main, 'plan/beats.md'),
    ],
    ['an edit naming a main-worktree file', anEdit('notes.txt'), main, join(main, 'notes.txt')],
    [
      'an absolute main-worktree path named from the linked worktree',
      aWrite(join(main, 'notes.txt')),
      linked,
      join(main, 'notes.txt'),
    ],
  ];

  it.each(mainCases)('refuses %s', (_what, event, cwd) => {
    expect(refused(event, { cwd, sessionManager: subagent })).toBe(true);
  });

  it.each(mainCases)('names the path and says absolute for %s', (_what, event, cwd, named) => {
    const reason = reasonFor(event, { cwd, sessionManager: subagent });
    expect(reason).toContain(named);
    expect(reason).toContain('absolute');
  });

  it('names each refused path when a call carries several', () => {
    const reason = reasonFor(anEdit('notes.txt', 'ignored/notes.md'), {
      cwd: main,
      sessionManager: subagent,
    });
    expect(reason).toContain(join(main, 'notes.txt'));
    expect(reason).not.toContain(join(main, 'ignored/notes.md'));
  });

  it('refuses an edit whose move destination lands in the main worktree', () => {
    const file = join(linked, 'notes.txt');
    const event = anEditOf(`[${file}#ABCD]\nMV notes.txt`, file);
    expect(reasonFor(event, { cwd: main, sessionManager: subagent })).toContain(
      join(main, 'notes.txt'),
    );
  });

  it('reads a quoted move destination', () => {
    const file = join(linked, 'notes.txt');
    const event = anEditOf(`[${file}#ABCD]\nMV "plan/beats.md"`, file);
    expect(reasonFor(event, { cwd: main, sessionManager: subagent })).toContain(
      join(main, 'plan/beats.md'),
    );
  });

  it('passes an edit whose move destination is in the linked worktree', () => {
    const file = join(linked, 'notes.txt');
    const event = anEditOf(`[${file}#ABCD]\nMV ${join(linked, 'moved.txt')}`, file);
    expect(refused(event, { cwd: main, sessionManager: subagent })).toBe(false);
  });

  it('refuses a file:// path in the main worktree', () => {
    expect(
      refused(aWrite(`file://${join(main, 'notes.txt')}`), { cwd: main, sessionManager: subagent }),
    ).toBe(true);
  });

  it('unwraps a path pasted as a read header before checking it', () => {
    const reason = reasonFor(aWrite(`[${join(main, 'notes.txt')}#AB12]`), {
      cwd: main,
      sessionManager: subagent,
    });
    expect(reason).toContain(join(main, 'notes.txt'));
    expect(reason).not.toContain('#AB12');
  });

  it('passes a read header for the linked worktree', () => {
    expect(
      refused(aWrite(`[${join(linked, 'notes.txt')}#AB12]`), {
        cwd: main,
        sessionManager: subagent,
      }),
    ).toBe(false);
  });

  it.each(mainCases)('passes %s from the main session', (_what, event, cwd) => {
    expect(refused(event, { cwd, sessionManager: mainSession })).toBe(false);
  });

  it.each([
    ['a write in the linked worktree', aWrite('notes.txt'), linked],
    ['an ignored file in the main worktree', aWrite('ignored/notes.md'), main],
    [
      'an ignored file named absolutely from the linked worktree',
      aWrite(join(main, 'ignored/notes.md')),
      linked,
    ],
    ['a path outside any repository', aWrite(outside), main],
    ['an internal URL', aWrite('local://notes.md'), main],
  ])('passes %s', (_what, event, cwd) => {
    expect(refused(event, { cwd, sessionManager: subagent })).toBe(false);
  });

  it('passes a call that writes no file', () => {
    expect(
      refused(
        { toolName: 'read', input: { path: 'notes.txt' } },
        { cwd: main, sessionManager: subagent },
      ),
    ).toBe(false);
  });
});
