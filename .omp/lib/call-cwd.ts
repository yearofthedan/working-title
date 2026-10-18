// The directory a bash call runs in, which a hook is handed as the session's.

import { homedir } from 'node:os';
import { join, resolve } from 'node:path';

// The directory a call names, read as the bash tool reads it: a leading `~` is
// expanded, a bare root is the session's, and the rest is resolved against it
// ([bash-tool-runtime](https://github.com/can1357/oh-my-pi/blob/main/docs/bash-tool-runtime.md)).
export const resolveCallCwd = (named: string, sessionCwd: string): string => {
  const home = homedir();
  const expanded =
    named === '~' || named.startsWith('~/') || named.startsWith('~\\')
      ? home + named.slice(1)
      : named.startsWith('~')
        ? join(home, named.slice(1))
        : named;
  return /^\/+$/.test(expanded) ? sessionCwd : resolve(sessionCwd, expanded);
};

// The directory the tool input names, or the session's where it names none
// ([hooks](https://github.com/can1357/oh-my-pi/blob/main/docs/hooks.md)).
export const callDirectory = (input: Record<string, unknown>, sessionCwd: string): string => {
  const named = input.cwd;
  return typeof named === 'string' && named !== '' ? resolveCallCwd(named, sessionCwd) : sessionCwd;
};
