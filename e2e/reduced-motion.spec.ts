import { expect, test } from './writer';

test.use({ reducedMotion: 'reduce', viewport: { width: 1100, height: 900 } });

test('a new scene arrives in one step while the writer asks for reduced motion', async ({
  writer,
}) => {
  await writer.opensTheApp();

  for (let scene = 0; scene < 8; scene += 1) {
    await writer.scope.group('Beat 1').press('Add a scene');
  }

  const steps = await writer.stepsTheGraphMovedWhile(() =>
    writer.scope.group('Beat 1').press('Add a scene'),
  );

  expect(steps).toBe(1);
});
