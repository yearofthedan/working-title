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

const verifyIntent = (approve: string): string =>
  `Scenarios are updated explicitly and intentionally, with ${approve}. Verify the intent of the update before continuing.`;

export const expectApproved = async (printed: string): Promise<void> => {
  const { testPath, currentTestName } = expect.getState();
  if (!testPath || !currentTestName) {
    throw new Error('expectApproved runs inside a test');
  }
  const file = approvedFile(testPath, currentTestName);
  const approve = `./do approve ${relative(process.cwd(), testPath)}`;
  try {
    await expect(printed).toMatchFileSnapshot(file);
  } catch (error) {
    if (existsSync(file) && error instanceof Error) {
      error.message += `\n\n${verifyIntent(approve)}`;
      throw error;
    }
    throw new Error(
      `${relative(process.cwd(), file)} is not approved yet. The scenario printed:\n\n${printed}\n` +
        verifyIntent(approve),
      { cause: error },
    );
  }
};
