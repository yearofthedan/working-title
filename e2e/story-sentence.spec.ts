import { expect, test } from './writer';

const summary = 'One-sentence summary';
const sentence = "A widow hunts the man who sank her husband's ship";

// The save is checked the moment the typing stopped: `typesInto` in one go, then a
// reload with no wait. A save that waited about a second for typing to settle would
// lose the sentence here.
test('the story sentence is still there after a reload', async ({ writer }) => {
  await writer.opensTheApp();
  await writer.typesInto(summary, sentence);
  await writer.reloads();
  await expect(writer.theField(summary)).toHaveValue(sentence);
});

// Typed key by key, then reloaded with no wait after the last one: a save that waited
// for typing to stop would lose the end of the sentence here.
test('a reload before typing has stopped loses nothing typed', async ({ writer }) => {
  await writer.opensTheApp();
  await writer.typesIntoLetterByLetter(summary, sentence);
  await writer.reloads();
  await expect(writer.theField(summary)).toHaveValue(sentence);
});

test('an emptied sentence stays empty after a reload', async ({ writer }) => {
  await writer.opensTheApp();
  await writer.typesInto(summary, sentence);
  await writer.empties(summary);
  await writer.reloads();
  await expect(writer.theField(summary)).toHaveValue('');
});

test('text with line breaks, quotes and non-Latin characters survives', async ({ writer }) => {
  const awkward = '«Начало» — it\'s "hers"\nand so it goes\n\n終わり';
  await writer.opensTheApp();
  await writer.typesInto(summary, awkward);
  await writer.reloads();
  await expect(writer.theField(summary)).toHaveValue(awkward);
});
