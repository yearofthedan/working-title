import { expect } from 'vite-plus/test';
import type { Locator } from 'vite-plus/test/browser';

export const expectVisuallyShown = (part: Locator): Promise<void> =>
  expect.element(part).toHaveStyle({ opacity: '1' });

export const expectVisuallyHidden = (part: Locator): Promise<void> =>
  expect.element(part).toHaveStyle({ opacity: '0' });

export const expectHidden = (part: Locator): Promise<void> =>
  expect.element(part).toHaveStyle({ visibility: 'hidden' });

export const expectRingDrawn = (part: Locator): Promise<void> =>
  expect.element(part).toHaveStyle({ outlineStyle: 'solid' });
