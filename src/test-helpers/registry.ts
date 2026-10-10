import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { closeSync, mkdtempSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type Server, type ServerResponse } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

/** A release the fixture registry serves, and what a case needs to be true of it. */
export type Release = {
  version: string;
  /** Minutes before the run that it was published, so a case's age is a fact of the fixture. */
  publishedMinutesAgo: number;
  /** Versions it depends on, so a case can put a release behind a transitive one. */
  requires?: Record<string, string>;
  /** Whether it carries a provenance attestation: the evidence `trustPolicy` reads. */
  provenance?: boolean;
};

export type Install = {
  status: number | null;
  output: string;
};

const octal = (value: number, length: number): string =>
  value.toString(8).padStart(length - 1, '0') + '\0';

/** A tar of one package.json, which is all a fixture package has to hold. */
const tarball = (name: string, version: string): Buffer => {
  const body = Buffer.from(JSON.stringify({ name, version }));
  const header = Buffer.alloc(512);
  header.write('package/package.json', 0, 'utf8');
  header.write(octal(0o644, 8), 100, 'utf8');
  header.write(octal(0, 8), 108, 'utf8');
  header.write(octal(0, 8), 116, 'utf8');
  header.write(octal(body.length, 12), 124, 'utf8');
  header.write(octal(0, 12), 136, 'utf8');
  header.write('        ', 148, 'utf8');
  header.write('0', 156, 'utf8');
  header.write('ustar\0', 257, 'utf8');
  header.write('00', 263, 'utf8');
  const sum = header.reduce((total, byte) => total + byte, 0);
  header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 'utf8');
  const padding = Buffer.alloc((512 - (body.length % 512)) % 512);
  return gzipSync(Buffer.concat([header, body, padding, Buffer.alloc(1024)]));
};

const integrity = (bytes: Buffer): string =>
  `sha512-${createHash('sha512').update(bytes).digest('base64')}`;

/** A registry serving the releases a case defines, over loopback and nothing else. */
export class FixtureRegistry {
  readonly origin: string;
  readonly #server: Server;
  readonly #packuments = new Map<string, string>();
  readonly #tarballs = new Map<string, Buffer>();

  private constructor(server: Server, port: number) {
    this.#server = server;
    this.origin = `http://127.0.0.1:${port}/`;
  }

  static async start(releases: Record<string, Release[]>): Promise<FixtureRegistry> {
    const server = createServer();
    const listening = Promise.withResolvers<void>();
    server.listen(0, '127.0.0.1', listening.resolve);
    await listening.promise;
    const address = server.address();
    if (address === null || typeof address === 'string') {
      throw new Error('the fixture registry has no port');
    }
    const registry = new FixtureRegistry(server, address.port);
    server.on('request', (request, response) => {
      registry.serve(decodeURIComponent(request.url ?? '/').replace(/^\//, ''), response);
    });
    registry.publish(releases);
    return registry;
  }

  /** Serves the releases a package has, replacing what it served before. */
  publish(releases: Record<string, Release[]>): void {
    for (const [name, versions] of Object.entries(releases)) this.#publish(name, versions);
  }

  /** The last release of a package is the one `latest` points at. */
  #publish(name: string, releases: Release[]): void {
    const time: Record<string, string> = {
      created: new Date(Date.now() - 365 * 24 * 60 * 60_000).toISOString(),
      modified: new Date().toISOString(),
    };
    const versions: Record<string, unknown> = {};
    for (const release of releases) {
      time[release.version] = new Date(
        Date.now() - release.publishedMinutesAgo * 60_000,
      ).toISOString();
      const bytes = tarball(name, release.version);
      const path = `${name}/-/${name.replace('@', '').replace('/', '-')}-${release.version}.tgz`;
      this.#tarballs.set(path, bytes);
      versions[release.version] = {
        name,
        version: release.version,
        dependencies: release.requires ?? {},
        dist: {
          tarball: `${this.origin}${path}`,
          integrity: integrity(bytes),
          ...(release.provenance
            ? {
                attestations: {
                  url: `${this.origin}-/npm/v1/attestations/${name}@${release.version}`,
                  provenance: { predicateType: 'https://slsa.dev/provenance/v1' },
                },
              }
            : {}),
        },
      };
    }
    this.#packuments.set(
      name,
      JSON.stringify({ name, 'dist-tags': { latest: releases.at(-1)?.version }, versions, time }),
    );
  }

  /** Serves the tarball of one release, or the packument of a package. */
  serve(path: string, response: ServerResponse): void {
    const bytes = this.#tarballs.get(path);
    const body = bytes ?? this.#packuments.get(path);
    if (body === undefined) {
      response.writeHead(404, { 'content-type': 'application/json' });
      response.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    response.writeHead(200, {
      'content-type': bytes === undefined ? 'application/json' : 'application/octet-stream',
    });
    response.end(body);
  }

  close(): void {
    this.#server.close();
  }
}

/** The version a lockfile records for a package, from its own section and no other line. */
const recordedIn = (lockfile: string, name: string): string | undefined =>
  lockfile.match(new RegExp(`^  '?${name.replace('/', '\\/')}@([^':(\\s]+)`, 'm'))?.[1];

const run = (
  file: string,
  args: string[],
  options: { cwd: string; env: NodeJS.ProcessEnv; answer?: string },
): Promise<Install> => {
  const settled = Promise.withResolvers<Install>();
  // BSD script ioctls its stdin, which a socket refuses, and a pipe from Node is one,
  // so the answer arrives through a file instead.
  const input = options.answer === undefined ? undefined : mkdtempSync(join(tmpdir(), 'answer-'));
  const answerFile = input === undefined ? undefined : join(input, 'answer');
  if (answerFile !== undefined) writeFileSync(answerFile, options.answer ?? '');
  const descriptor = answerFile === undefined ? undefined : openSync(answerFile, 'r');
  const child = spawn(file, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: [descriptor ?? 'pipe', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout?.on('data', (chunk: Buffer) => (output += chunk.toString()));
  child.stderr?.on('data', (chunk: Buffer) => (output += chunk.toString()));
  child.on('close', (status) => {
    if (descriptor !== undefined) closeSync(descriptor);
    if (input !== undefined) rmSync(input, { recursive: true, force: true });
    settled.resolve({ status, output });
  });
  child.stdin?.end('');
  return settled.promise;
};

const installArgs = (options: { frozen?: boolean } = {}): string[] => [
  'install',
  '--reporter=append-only',
  ...(options.frozen ? ['--frozen-lockfile'] : []),
];

/** A scratch project whose installs resolve against a registry the case defines. */
export class Fixture {
  readonly dir: string;
  readonly #registry: FixtureRegistry;

  private constructor(dir: string, registry: FixtureRegistry) {
    this.dir = dir;
    this.#registry = registry;
  }

  static async create(options: {
    releases: Record<string, Release[]>;
    dependencies: Record<string, string>;
    /**
     * The workspace settings to install under: this repo's own file, so a case tests the
     * settings that ship, unless a case says otherwise.
     */
    settings?: string;
  }): Promise<Fixture> {
    const registry = await FixtureRegistry.start(options.releases);
    const dir = mkdtempSync(join(tmpdir(), 'fixture-'));
    const manifest = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
      packageManager?: string;
    };
    writeFileSync(
      join(dir, 'package.json'),
      JSON.stringify(
        {
          name: 'fixture',
          private: true,
          // The version this repo pins, so a case exercises the pnpm that installs it.
          packageManager: manifest.packageManager,
          dependencies: options.dependencies,
        },
        null,
        2,
      ),
    );
    writeFileSync(
      join(dir, '.npmrc'),
      // A cache of its own, so pnpm reads the fixture's metadata rather than a stale copy.
      `registry=${registry.origin}\ncacheDir=${join(dir, 'cache')}\n`,
    );
    const fixture = new Fixture(dir, registry);
    fixture.settings(options.settings ?? readFileSync(join(root, 'pnpm-workspace.yaml'), 'utf8'));
    return fixture;
  }

  settings(content: string): void {
    writeFileSync(join(this.dir, 'pnpm-workspace.yaml'), content);
  }

  /** Adds releases to a package the fixture already serves, as a later step of a case says. */
  publishes(releases: Record<string, Release[]>): void {
    this.#registry.publish(releases);
  }

  read(file: string): string {
    return readFileSync(join(this.dir, file), 'utf8');
  }

  /** The version of a package the install left materialised, if it left one. */
  versionOf(name: string): string | undefined {
    try {
      const manifest = JSON.parse(
        readFileSync(join(this.dir, 'node_modules', name, 'package.json'), 'utf8'),
      ) as { version?: string };
      return manifest.version;
    } catch {
      return undefined;
    }
  }

  resolved(name: string): string | undefined {
    return recordedIn(this.read('pnpm-lock.yaml'), name);
  }

  /** Installs with no terminal to approve at, as CI does: pnpm refuses rather than prompts. */
  install(options: { frozen?: boolean } = {}): Promise<Install> {
    return run('pnpm', installArgs(options), {
      cwd: this.dir,
      env: { ...process.env, CI: 'true' },
    });
  }

  /** Installs at a terminal and answers pnpm's own prompt, as a builder does. */
  approve(answer = 'y'): Promise<Install> {
    const { CI: _, CONTINUOUS_INTEGRATION: __, ...env } = process.env;
    const command = ['pnpm', ...installArgs()];
    // script gives the install a terminal; the flags differ between BSD and util-linux.
    const [file, args] =
      process.platform === 'darwin'
        ? ['script', ['-q', '/dev/null', ...command]]
        : ['script', ['-qec', command.join(' '), '/dev/null']];
    return run(file as string, args as string[], {
      cwd: this.dir,
      env: { ...env, TERM: process.env.TERM ?? 'xterm-256color' },
      answer: `${answer}\n`,
    });
  }

  remove(): void {
    this.#registry.close();
    rmSync(this.dir, { recursive: true, force: true });
  }
}
