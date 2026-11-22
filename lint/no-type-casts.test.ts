import { afterAll, beforeAll, describe, expect, it } from 'vite-plus/test';
import { lintSamples, type SampleLint } from './sample-lint';

const sample = 'const n = "value" as string;\n';

let lint: SampleLint;

beforeAll(() => {
  lint = lintSamples('lint', { 'sample.ts': sample });
});

afterAll(() => lint.dispose());

describe('type casts', { timeout: 60_000 }, () => {
  it('a type assertion fails lint', () => {
    expect(lint.errorsIn('sample.ts')).toEqual([expect.stringContaining('type assertion')]);
  });
});
