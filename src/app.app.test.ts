import { afterEach, describe, expect, it } from 'vite-plus/test';
import { startApp } from './app';
import { thePage } from './test-helpers/staging';
import { vitestBrowserDriver } from './test-helpers/vitest-browser.driver';

const stored = 'working-title:project';

let stop: (() => void) | undefined;

const stageTheApp = async (): Promise<void> => {
  stop?.();
  stop = await startApp(await thePage(1440));
};

afterEach(() => {
  stop?.();
  stop = undefined;
});

describe('what the app saves to the browser', () => {
  it("saves each keystroke to the browser's storage", async () => {
    const driver = vitestBrowserDriver();
    localStorage.clear();
    await stageTheApp();

    await driver.type('A wid', 'One-sentence summary', { role: 'group', name: 'The story' });

    expect(localStorage.getItem(stored)).toContain('A wid');
  });

  it('reads a saved sentence back on a fresh page', async () => {
    const driver = vitestBrowserDriver();
    const sentence = "Maren finds the ship's log";
    localStorage.clear();
    await stageTheApp();

    await driver.type(sentence, 'One-sentence summary', { role: 'group', name: 'Beat 4' });

    await stageTheApp();
    await driver.click('heading', 'Beat 4', { role: 'group', name: 'Beat 4' });

    const held = await driver.value('One-sentence summary', { role: 'group', name: 'Beat 4' });
    expect(held).toBe(sentence);
  });
});
