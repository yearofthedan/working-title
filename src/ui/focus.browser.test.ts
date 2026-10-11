import { expect, it } from 'vite-plus/test';
import { page } from 'vite-plus/test/browser';
import { renderFocus } from './focus';

it('prints the tree of the real field', async () => {
  const main = document.createElement('main');
  document.body.append(main);
  renderFocus(main, {
    facets: [{ id: 'one-sentence-summary', label: 'One-sentence summary', text: '' }],
    elaborate: async () => {},
  });

  await page
    .getByLabelText('One-sentence summary')
    .fill("A widow hunts the man who sank her husband's ship");
  // No argument: ./do approve writes what Vitest took, so its text can be compared
  // with what Playwright printed for the same field.
  await expect.element(page.getByRole('main')).toMatchAriaSnapshot();
});
