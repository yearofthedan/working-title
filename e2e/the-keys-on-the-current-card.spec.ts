import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from './writer';

const theKeys = 'Enter to write · Tab for the next row · ← → along the row · ↑ ↓ a level';

const theRecordedKeysLine = (): string => {
  const recorded = readFileSync(
    join(
      dirname(fileURLToPath(import.meta.url)),
      '../src/ui/card/scenarios/inside-the-current-card.approved.md',
    ),
    'utf8',
  );
  const line = recorded.split('\n').find((one) => one.includes('- paragraph:'));
  if (line === undefined) throw new Error('no approved card scenario records a keys line');
  return line.trim();
};

test('a screen reader says the keys on the current card, and on no other', async ({ writer }) => {
  await writer.opensANewProject();

  expect(await writer.descriptionOfTheCard('The story')).toBe(theKeys);
  expect(await writer.descriptionOfTheCard('Beat 1')).toBe('');
});

test('both runners record the same keys line', async ({ writer }) => {
  await writer.opensANewProject();

  expect(await writer.theKeysLine()).toBe(theRecordedKeysLine());
});
