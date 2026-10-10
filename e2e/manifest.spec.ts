import { expect, test } from '@playwright/test';

test("the install splash uses the page's background colour", async ({ page }) => {
  await page.goto('/');
  const { background_color } = await (await page.request.get('/manifest.webmanifest')).json();
  const [manifest, body] = await page.evaluate((colour) => {
    // The browser normalises both colours to rgb() so a hex value compares with a computed one.
    const probe = document.createElement('div');
    probe.style.backgroundColor = colour;
    document.body.append(probe);
    return [
      getComputedStyle(probe).backgroundColor,
      getComputedStyle(document.body).backgroundColor,
    ];
  }, background_color);
  expect(manifest).toBe(body);
});
