import { homedir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import { resolveCallCwd } from './call-cwd';

describe('resolveCallCwd', () => {
  it.each([
    ['~/notes', join(homedir(), 'notes')],
    ['~', homedir()],
    ['~someone', join(homedir(), 'someone')],
    ['@/tmp/elsewhere', '/tmp/elsewhere'],
    ['@~/notes', join(homedir(), 'notes')],
    ['file:///tmp/elsewhere', '/tmp/elsewhere'],
    ['FILE:///tmp/elsewhere', '/tmp/elsewhere'],
    [':/tmp/elsewhere', '/tmp/elsewhere'],
    ['/tmp/a\u00A0b', '/tmp/a b'],
    ['/tmp/elsewhere', '/tmp/elsewhere'],
    ['plan', '/session/plan'],
    ['/', '/session'],
    // None of these is a shorthand, so the `@` and the `:` stand as typed.
    ['@my-file.txt', '/session/@my-file.txt'],
    ['@~someone', '/session/@~someone'],
    [':plan', '/session/:plan'],
  ])('reads a call naming %s as %s', (named, wanted) => {
    expect(resolveCallCwd(named, '/session')).toBe(wanted);
  });
});
