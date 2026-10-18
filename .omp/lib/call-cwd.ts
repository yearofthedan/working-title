// The directory a bash call runs in, which a hook is handed as the session's.

import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const UNICODE_SPACES = /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g;

// The directory a call names, read as the bash tool reads it: a stray leading `:`, an
// `@`, a `file://` URL and the spaces a path is often typed with are taken off, a
// leading `~` is expanded, a bare root is the session's, and the rest is resolved
// against it
// ([resolveToCwd](https://github.com/can1357/oh-my-pi/blob/main/packages/coding-agent/src/tools/path-utils.ts), [bash-tool-runtime](https://github.com/can1357/oh-my-pi/blob/main/docs/bash-tool-runtime.md)).
// shortcut: the Windows drive aliases and the macOS name variants are not read, since
// no session here runs on Windows or names a screenshot; read them if one does.
export const resolveCallCwd = (named: string, sessionCwd: string): string => {
  let at = /^:(?=[/~]|\.\.?[/\\])/.test(named) ? named.slice(1) : named;
  if (at.startsWith('@') && /^[/~]/.test(at.slice(1))) at = at.slice(1);
  at = at.replace(UNICODE_SPACES, ' ');
  if (at.startsWith('file://')) {
    try {
      at = fileURLToPath(at);
    } catch {
      // Not a URL this platform can read: the path stands as typed, as the tool leaves it.
    }
  }
  const home = homedir();
  const expanded =
    at === '~' || at.startsWith('~/') || at.startsWith('~\\')
      ? home + at.slice(1)
      : at.startsWith('~')
        ? join(home, at.slice(1))
        : at;
  return /^\/+$/.test(expanded) ? sessionCwd : resolve(sessionCwd, expanded);
};

// The directory the tool input names, or the session's where it names none
// ([hooks](https://github.com/can1357/oh-my-pi/blob/main/docs/hooks.md)).
export const callDirectory = (input: Record<string, unknown>, sessionCwd: string): string => {
  const named = input.cwd;
  return typeof named === 'string' && named !== '' ? resolveCallCwd(named, sessionCwd) : sessionCwd;
};
