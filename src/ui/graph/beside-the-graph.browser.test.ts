import { describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import { settled } from '../../test-helpers/driver';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import {
  drawsOpenBeside,
  nameOf,
  openBesideIsPressed,
  openBesideOf,
  showsOpenBeside,
} from '../card/card.test-page';
import { closeButtonOf, fieldFor, panelOf } from '../panel/panel.test-page';
import { pageWith } from './graph.harness';
import { atFocus, blurTheFocus, current, headerOf, named } from './graph.test-page';

const thePanelIsOpen = async (): Promise<boolean> =>
  (await vitestBrowserDriver(undefined, 'page').tree()).some((line) =>
    line.includes('- complementary'),
  );

const thePanelIsOn = async (piece: string): Promise<boolean> =>
  (await vitestBrowserDriver(undefined, 'page').tree()).some((line) =>
    line.includes(`- complementary "${piece}"`),
  );

describe('opening a piece beside the graph', () => {
  it('puts the focus inside the panel when a beat opens beside the graph', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();

    await writer.opensBeside('Beat 2');
    await settled();

    expect(panelOf().contains(atFocus())).toBe(true);
  });

  it('keeps the icon of the beat beside pressed, and unpressed once it is closed', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();

    await writer.opensBeside('Beat 2');
    await settled();
    expect(openBesideIsPressed(named('current', 'Beat 2'))).toBe(true);

    await writer.closesThePanel();
    await settled();

    expect(openBesideIsPressed(named('current', 'Beat 2'))).toBe(false);
    expect(await thePanelIsOpen()).toBe(false);
  });

  it('closes the panel when the lit icon is clicked again', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();
    const card = named('current', 'Beat 2');

    await browser.userEvent.click(openBesideOf(card));
    await settled();

    expect(await thePanelIsOpen()).toBe(false);
  });

  it('runs the panel the full height of the page, past the header', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();

    const panel = panelOf().getBoundingClientRect();
    const header = headerOf().getBoundingClientRect();

    expect(panel.top).toBe(0);
    expect(panel.height).toBe(window.innerHeight);
    expect(header.top).toBeGreaterThanOrEqual(panel.top);
    expect(header.bottom).toBeLessThanOrEqual(panel.bottom);
  });

  it('leaves the focus on the Close button when an arrow key is pressed there', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();
    const close = closeButtonOf(panelOf());
    close.focus();

    await driver.press('ArrowRight');
    await settled();

    expect(atFocus()).toBe(close);
    expect(nameOf(current())).toBe('Beat 2');
  });

  it('puts the focus back on the icon that opened it, and on the focus card when that beat is a chip', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();

    await writer.closesThePanel();
    await settled();
    expect(atFocus()).toBe(openBesideOf(named('current', 'Beat 2')));

    await writer.opensBeside('Beat 2');
    await writer.clicks('Beat 4');
    await settled();

    await writer.closesThePanel();
    await settled();

    expect(atFocus()).toBe(named('current', 'Beat 4'));
  });

  it('closes the panel on Esc, putting the focus back on the icon', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();
    closeButtonOf(panelOf()).focus();

    await driver.press('Escape');
    await settled();

    expect(await thePanelIsOpen()).toBe(false);
    expect(atFocus()).toBe(openBesideOf(named('current', 'Beat 2')));
  });

  it('shows the icon while the pointer is over the card or the focus is within it, and draws none on a chip or the story card', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await settled();
    const card = named('current', 'Beat 2');
    blurTheFocus();

    await browser.userEvent.hover(named('card', 'The story'));
    expect(showsOpenBeside(card)).toBe(false);

    await browser.userEvent.hover(card);
    expect(showsOpenBeside(card)).toBe(true);

    await browser.userEvent.hover(named('card', 'The story'));
    expect(showsOpenBeside(card)).toBe(false);

    card.focus();
    expect(showsOpenBeside(card)).toBe(true);

    await browser.userEvent.hover(named('chip', 'Beat 1'));
    expect(showsOpenBeside(named('chip', 'Beat 1'))).toBe(false);

    await browser.userEvent.hover(named('card', 'The story'));
    expect(drawsOpenBeside(named('card', 'The story'))).toBe(false);
  });

  it('keeps a scene open beside the graph while the focus moves off it', async () => {
    const { stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.makesCurrent('Beat 4');
    await writer.opensBeside('Scene 1');
    await settled();

    await writer.makesCurrent('The story');
    await settled();

    expect(await thePanelIsOn('Scene 1')).toBe(true);
  });

  it('replaces the beat beside the graph when a scene opens', async () => {
    const { stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.makesCurrent('Beat 4');
    await writer.opensBeside('Beat 4');
    await settled();

    await writer.opensBeside('Scene 1');
    await settled();

    expect(await thePanelIsOn('Scene 1')).toBe(true);
    expect(fieldFor(panelOf(), 'Narrative')).toBeDefined();
    expect(() => fieldFor(panelOf(), 'Page')).toThrow();
  });

  it('replaces the scene beside the graph when a beat opens', async () => {
    const { stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.makesCurrent('Beat 4');
    await writer.opensBeside('Scene 1');
    await settled();
    const card = named('card', 'Beat 4');

    await browser.userEvent.hover(card);
    await browser.userEvent.click(openBesideOf(card));
    await settled();

    expect(await thePanelIsOn('Beat 4')).toBe(true);
    expect(fieldFor(panelOf(), 'Page')).toBeDefined();
    expect(() => fieldFor(panelOf(), 'Narrative')).toThrow();
  });
});
