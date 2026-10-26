import { describe, expect, it } from 'vite-plus/test';
import { browserScope } from '../../test-helpers/browser-scope';
import { openTheApp, thePage } from '../../test-helpers/the-app';
import { focusPageActions } from './writer';

const typing = 'types "{text}" as {scene}\'s list line under {beat}';

const pageWithTwoScenesUnderBeat4 = () => {
  const scope = browserScope(async () => {
    localStorage.clear();
    const main = await thePage(1440);
    await openTheApp(main);
    for (let at = 0; at < 2; at += 1) {
      await scope.group('Beat 4').click();
      await scope.group('Beat 4').press('Add a scene');
    }
    await scope.group('Beat 4').click();
  });
  return scope;
};

describe('the focus page actions', () => {
  it('refuses a scene that is not under the beat named', async () => {
    const scope = pageWithTwoScenesUnderBeat4();
    await scope.fresh();
    const type = focusPageActions(scope)[typing]!;

    await expect(
      Promise.resolve(type({ text: 'Maren rows out', scene: 'Scene 1', beat: 'Beat 2' })),
    ).rejects.toThrow('Scene 1 is not under Beat 2');
  });
});
