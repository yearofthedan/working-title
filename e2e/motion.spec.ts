import { expect, test } from './writer';

test('nothing moves as the app opens and the web font arrives', async ({ writer }) => {
  await writer.opensANewProject();

  const frames = await writer.opensWatchingTheGraph();

  expect(frames.length).toBeGreaterThan(1);
  expect([...new Set(frames)]).toHaveLength(1);
});
