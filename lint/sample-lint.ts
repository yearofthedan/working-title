import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

type Diagnostic = { code: string; filename: string; help: string; message: string };

export interface SampleLint {
  errorsIn(file: string): string[];
  dispose(): void;
}

const isRestriction = (code: string) =>
  code.startsWith('eslint(no-restricted-') ||
  code.startsWith('eslint-js(no-restricted-') ||
  code === 'typescript(consistent-type-assertions)';

const refusalOf = ({ code, help, message }: Diagnostic) =>
  code === 'eslint(no-restricted-globals)' || code.startsWith('eslint-js(') ? message : help;

export const lintSamples = (root: string, samples: Record<string, string>): SampleLint => {
  const dir = mkdtempSync(`${root}/lint-sample-`);
  const files = Object.entries(samples).map(([file, content]) => {
    const path = join(dir, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    return path;
  });
  const run = spawnSync('vp', ['lint', '--format', 'json', ...files], { encoding: 'utf8' });
  const { diagnostics }: { diagnostics: Diagnostic[] } = JSON.parse(run.stdout);

  const refusals = new Map<string, string[]>();
  for (const diagnostic of diagnostics) {
    if (isRestriction(diagnostic.code))
      refusals.set(diagnostic.filename, [
        ...(refusals.get(diagnostic.filename) ?? []),
        refusalOf(diagnostic),
      ]);
  }

  return {
    errorsIn: (file: string) => refusals.get(join(dir, file)) ?? [],
    dispose: () => rmSync(dir, { recursive: true, force: true }),
  };
};
