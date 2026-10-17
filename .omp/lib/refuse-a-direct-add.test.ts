import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vite-plus/test';
import refuseADirectAdd, { type Extension } from './refuse-a-direct-add';

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
  refuseADirectAdd(pi);
  if (registered === undefined) throw new Error('the extension registered no handler');
  return registered;
};

const repository = (dirty = false): string => {
  const dir = mkdtempSync(join(tmpdir(), 'refuse-a-direct-add-'));
  execFileSync('git', ['init', '-q', dir]);
  writeFileSync(join(dir, 'package.json'), '{}\n');
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
  if (dirty) writeFileSync(join(dir, 'package.json'), '{"devDependencies":{"lodash":"4.17.20"}}\n');
  return dir;
};

const refused = (command: string, cwd: string): boolean =>
  handler()({ toolName: 'bash', input: { command } }, { cwd }) !== undefined;

describe('refuseADirectAdd', () => {
  const clean = repository();

  it('refuses pnpm add', () => {
    expect(refused('pnpm add lodash', clean)).toBe(true);
  });

  it('refuses pnpm add whatever flags it carries', () => {
    expect(refused('pnpm add -D lodash --ignore-scripts', clean)).toBe(true);
  });

  it('refuses pnpm i naming a package', () => {
    expect(refused('pnpm i lodash', clean)).toBe(true);
  });

  it('refuses pnpm install naming a package', () => {
    expect(refused('pnpm install lodash', clean)).toBe(true);
  });

  it('refuses pnpm update', () => {
    expect(refused('pnpm update', clean)).toBe(true);
  });

  it('refuses pnpm dlx', () => {
    expect(refused('pnpm dlx cowsay', clean)).toBe(true);
  });

  it('refuses npx', () => {
    expect(refused('npx cowsay', clean)).toBe(true);
  });

  it('refuses another package manager', () => {
    expect(refused('yarn add lodash', clean)).toBe(true);
  });

  it('refuses a pnpm add behind another command', () => {
    expect(refused('cd /tmp && pnpm add lodash', clean)).toBe(true);
  });

  it('refuses pnpm install where the manifest differs from HEAD', () => {
    expect(refused('pnpm install', repository(true))).toBe(true);
  });

  it('passes pnpm install where the manifest matches HEAD', () => {
    expect(refused('pnpm install', clean)).toBe(false);
  });

  it('passes pnpm install --frozen-lockfile where the manifest differs from HEAD', () => {
    expect(refused('pnpm install --frozen-lockfile', repository(true))).toBe(false);
  });

  it('passes pnpm test', () => {
    expect(refused('pnpm test', clean)).toBe(false);
  });

  it('passes ./do add', () => {
    expect(refused('./do add -D lodash', clean)).toBe(false);
  });

  it('passes a command that names no package manager', () => {
    expect(refused('git status', clean)).toBe(false);
  });
});
