import { spawn, type ChildProcess } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stripVTControlCharacters } from 'node:util';
import { test as base } from './writer';

export interface Build {
  readonly baseURL: string;
  publishNewVersion(): Promise<void>;
}

export const newVersionTitle = 'working-title (new version)';

const stopServing = (server: ChildProcess): void => {
  if (server.pid !== undefined && server.exitCode === null && server.signalCode === null) {
    process.kill(-server.pid, 'SIGTERM');
  }
};

const copyOfTheBuild = async (): Promise<{
  dir: string;
  url: string;
  stop: () => Promise<void>;
}> => {
  const dir = mkdtempSync(join(tmpdir(), 'working-title-'));
  const remove = () => rmSync(dir, { recursive: true, force: true });
  cpSync(join(process.cwd(), 'dist'), dir, { recursive: true });
  const server = spawn('vp', ['preview', '--outDir', dir, '--port', '0'], {
    stdio: ['ignore', 'pipe', 'inherit'],
    detached: true,
  });
  const { promise, resolve, reject } = Promise.withResolvers<string>();
  let output = '';
  server.stdout.on('data', (chunk: Buffer) => {
    output += stripVTControlCharacters(chunk.toString());
    const found = /Local:\s+(http:\/\/localhost:\d+)/.exec(output);
    if (found !== null) resolve(found[1] ?? '');
  });
  server.on('error', reject);
  server.on('exit', (code) => reject(new Error(`vp preview exited with ${code} before it served`)));
  const gaveUp = setTimeout(
    () => reject(new Error('vp preview printed no address in 20s')),
    20_000,
  );
  const url = await promise
    .finally(() => clearTimeout(gaveUp))
    .catch((error: unknown) => {
      stopServing(server);
      remove();
      throw error;
    });
  return {
    dir,
    url,
    stop: async () => {
      stopServing(server);
      remove();
    },
  };
};

const publishNewVersion = (dir: string): void => {
  const index = join(dir, 'index.html');
  const sw = join(dir, 'sw.js');
  const oldIndex = readFileSync(index, 'utf8');
  const oldRevision = createHash('md5').update(oldIndex).digest('hex');
  const title = oldIndex.replace(/<title>[^<]*<\/title>/, `<title>${newVersionTitle}</title>`);
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
