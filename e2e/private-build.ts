import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test as base } from './writer';

export interface Build {
  readonly baseURL: string;
  publishNewVersion(): Promise<void>;
}

const newTitle = '<title>working-title (new version)</title>';

const copyOfTheBuild = async (): Promise<{
  dir: string;
  url: string;
  stop: () => Promise<void>;
}> => {
  const dir = mkdtempSync(join(tmpdir(), 'working-title-'));
  cpSync(join(process.cwd(), 'dist'), dir, { recursive: true });
  const server = spawn('vp', ['preview', '--outDir', dir, '--port', '0'], {
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  let output = '';
  server.stdout.on('data', (chunk: Buffer) => {
    output += chunk.toString();
    const found = /Local:\s+(http:\/\/localhost:\d+)/.exec(output);
    if (found !== null) resolve(found[1] ?? '');
  });
  server.on('error', reject);
  const url = await promise;
  return {
    dir,
    url,
    stop: async () => {
      server.kill();
      const exited = Promise.withResolvers<void>();
      server.once('exit', () => exited.resolve());
      await exited.promise;
      rmSync(dir, { recursive: true, force: true });
    },
  };
};

const publishNewVersion = (dir: string): void => {
  const index = join(dir, 'index.html');
  const sw = join(dir, 'sw.js');
  const oldIndex = readFileSync(index, 'utf8');
  const oldRevision = createHash('md5').update(oldIndex).digest('hex');
  const title = oldIndex.replace(/<title>[^<]*<\/title>/, newTitle);
  if (title === oldIndex) throw new Error('the title did not change');
  const newRevision = createHash('md5').update(title).digest('hex');
  const oldSw = readFileSync(sw, 'utf8');
  const changed = oldSw.replace(`revision:"${oldRevision}"`, `revision:"${newRevision}"`);
  if (changed === oldSw) throw new Error('the revision did not change');
  writeFileSync(index, title);
  writeFileSync(sw, changed);
};

export const test = base.extend<{ build: Build; baseURL: string }>({
  build: async ({}, use) => {
    const served = await copyOfTheBuild();
    try {
      await use({
        baseURL: served.url,
        publishNewVersion: async () => publishNewVersion(served.dir),
      });
    } finally {
      await served.stop();
    }
  },
  baseURL: async ({ build }, use) => {
    await use(build.baseURL);
  },
});
