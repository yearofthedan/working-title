import { expect, test } from './writer';

test("the install splash uses the page's background colour", async ({ writer, page }) => {
  await writer.opensTheApp();
  const { background_color } = await (await page.request.get('/manifest.webmanifest')).json();
  const [manifest, body] = await page.evaluate((colour) => {
    const normalised = document.createElement('div');
    normalised.style.backgroundColor = colour;
    document.body.append(normalised);
    return [
      getComputedStyle(normalised).backgroundColor,
      getComputedStyle(document.body).backgroundColor,
    ];
  }, background_color);
  expect(manifest).toBe(body);
});
