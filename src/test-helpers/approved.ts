import { existsSync } from 'node:fs';
import { basename, dirname, join, relative } from 'node:path';
import { expect } from 'vite-plus/test';

const slug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const approvedFile = (testPath: string, testName: string): string =>
  join(
    dirname(testPath),
    `${basename(testPath).replace(/\.test\.ts$/, '')}.${slug(testName)}.approved.md`,
  );

// Vitest reports a missing file snapshot as a bare mismatch, so the printed text is added here.
export const expectApproved = async (printed: string): Promise<void> => {
  const { testPath, currentTestName } = expect.getState();
  if (!testPath || !currentTestName) {
    throw new Error('expectApproved runs inside a test');
  }
  const file = approvedFile(testPath, currentTestName);
  try {
    await expect(printed).toMatchFileSnapshot(file);
  } catch (error) {
    if (existsSync(file)) {
      throw error;
    }
    throw new Error(
      `${relative(process.cwd(), file)} is not approved yet. The scenario printed:\n\n${printed}\n` +
        `Approve it with ./do approve ${relative(process.cwd(), testPath)}`,
      { cause: error },
    );
  }
};
