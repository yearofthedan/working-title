import { expect, test } from './writer';

const longSentence =
  'She rows out before first light with the chart weighted under a stone and finds a buoy ringing a bell nobody hung there, its rope still wet from a hand.';

test("all text on a new project's graph meets 4.5:1 contrast", async ({ writer }) => {
  await writer.opensANewProject();

  expect(await writer.contrastViolations()).toEqual([]);
});

test('all text on the graph meets 4.5:1 contrast with long sentences in the story and a beat', async ({
  writer,
}) => {
  await writer.opensANewProject();
  await writer.types(longSentence, { piece: 'The story', facet: 'One-sentence summary' });
  expect(await writer.contrastViolations()).toEqual([]);

  await writer.types(longSentence, { piece: 'Beat 2', facet: 'One-sentence summary' });
  expect(await writer.contrastViolations()).toEqual([]);
});

test("all text on the graph meets 4.5:1 contrast with a scene's long list line", async ({
  writer,
}) => {
  await writer.opensANewProject();
  await writer.focuses('Beat 2');
  await writer.addsASceneUnder('Beat 2');
  await writer.types(longSentence, { piece: 'Scene 1', facet: 'List line' });

  expect(await writer.contrastViolations()).toEqual([]);
});
