import { expect, test } from './writer';

const longSentence =
  'She rows out before first light with the chart weighted under a stone and finds a buoy ringing a bell nobody hung there, its rope still wet from a hand.';

test("all text on a new project's graph meets 4.5:1 contrast", async ({ writer }) => {
  await writer.opensTheApp();

  expect(await writer.contrastViolations()).toEqual([]);
});

test('all text on the graph meets 4.5:1 contrast with long sentences in the story and a beat', async ({
  writer,
}) => {
  await writer.opensTheApp();
  await writer.scope.group('The story').field('One-sentence summary').enter(longSentence);
  await writer.scope.group('Beat 2').field('One-sentence summary').enter(longSentence);

  expect(await writer.contrastViolations()).toEqual([]);
});
