import { afterEach, describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import { widthOf } from '../../test-helpers/box';
import { settled, type Driver } from '../../test-helpers/driver';
import { easesOut } from '../../test-helpers/frames';
import { laidOut, moving } from '../../test-helpers/graph-page';
import type { RawGlob } from '../../test-helpers/raw-glob';
import { playScenarioFiles } from '../../test-helpers/scenario-entry';
import { anInMemoryProject } from '../../test-helpers/seed';
import {
  aPageWithoutAHeader,
  aPageWithoutAMain,
  aPageWithoutAnAside,
  narrowThePane,
} from '../../test-helpers/staging';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import {
  drawsOpenBeside,
  nameOf,
  openBesideIsPressed,
  openBesideOf,
  showsOpenBeside,
  timesDrawn,
} from '../card/card.test-page';
import {
  atFocus,
  blurTheFocus,
  cardAtFocus,
  current,
  everyCard,
  named,
} from '../graph/graph.test-page';
import { closeButtonOf, fieldFor, panelOf } from '../panel/panel.test-page';
import { renderApp } from './app.dom';
import { appSteps, type AppWriter } from './app.dsl';
import { appScenarioSteps, pageWith } from './app.harness';
import { headerOf } from './app.test-page';

const theStory = "A widow hunts the man who sank her husband's ship";

const typed = 'types "{text}" as {scene}\'s list line under {beat}';

const pathTo = (driver: Driver, piece: string): Promise<void> =>
  driver.click('button', piece, { role: 'navigation', name: 'Where you are' });

const boxes = (): readonly string[] =>
  everyCard().map((card) => {
    const box = card.getBoundingClientRect();
    return `${nameOf(card)} ${box.left} ${box.top} ${box.width} ${box.height}`;
  });

const thePanelIsOpen = async (): Promise<boolean> =>
  (await vitestBrowserDriver(undefined, 'page').tree()).some((line) =>
    line.includes('- complementary'),
  );

const thePanelIsOn = async (piece: string): Promise<boolean> =>
  (await vitestBrowserDriver(undefined, 'page').tree()).some((line) =>
    line.includes(`- complementary "${piece}"`),
  );

describe('starting the app', () => {
  it('refuses a page with no main', async () => {
    const { project } = await anInMemoryProject();

    await expect(renderApp(aPageWithoutAMain(), project)).rejects.toThrow('the page has no <main>');
  });

  it('refuses a page with no header', async () => {
    const { project } = await anInMemoryProject();

    await expect(renderApp(aPageWithoutAHeader(), project)).rejects.toThrow(
      'the page has no <header>',
    );
  });

  it('refuses a page with no aside to open a piece beside', async () => {
    const { project } = await anInMemoryProject();

    await expect(renderApp(aPageWithoutAnAside(), project)).rejects.toThrow(
      'the page has no <aside>',
    );
  });
});

describe('the writer’s words reach the application', () => {
  it('tells the application about every keystroke as it is typed', async () => {
    const { stage, store, writer } = pageWith();
    await stage.fresh();

    await writer.types('A wid', { piece: 'The story', facet: 'One-sentence summary' });
    expect(JSON.stringify(await store.load())).toContain('A wid');

    await writer.types(theStory, { piece: 'The story', facet: 'One-sentence summary' });
    expect(JSON.stringify(await store.load())).toContain(theStory);
  });

  it("draws the sentence on the current piece's card once", async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.types(theStory, { piece: 'The story', facet: 'One-sentence summary' });

    expect(timesDrawn(current(), theStory)).toBe(1);
  });
});

describe('what the app keeps', () => {
  it('writes nothing to storage', async () => {
    const { driver, stage, store, writer } = pageWith();
    await stage.fresh();
    await writer.types("Maren finds the ship's log", {
      piece: 'Beat 2',
      facet: 'One-sentence summary',
    });
    const before = await store.load();
    expect(before).not.toBeUndefined();

    await driver.press('ArrowRight');
    await driver.press('ArrowUp');
    await writer.clicks('Beat 1');

    expect(await store.load()).toBe(before);
  });

  it('opens on the story when the page is drawn again', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    expect(nameOf(current())).toBe('Beat 2');

    await stage.reopen();

    expect(nameOf(current())).toBe('The story');
  });

  it('saves a sentence typed into a card after clicking it, read back by a fresh page', async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    const sentence = "Maren finds the ship's log";
    await writer.types(sentence, { piece: 'Beat 4', facet: 'One-sentence summary' });

    await stage.reopen();
    await writer.clicks('Beat 4');

    const held = await driver.value('One-sentence summary', { role: 'group', name: 'Beat 4' });
    expect(held).toBe(sentence);
  });
});

describe('the path in the header', () => {
  it("leaves the cursor on the new current piece's card after a path click", async () => {
    const { driver, stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 4');
    expect(nameOf(current())).toBe('Beat 4');
    expect(cardAtFocus()).toBe(current());

    await pathTo(driver, 'The story');

    expect(nameOf(current())).toBe('The story');
    expect(cardAtFocus()).toBe(current());
  });
});

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

const moves: ReadonlyArray<{
  readonly what: string;
  readonly play: (writer: AppWriter, driver: Driver) => Promise<void>;
}> = [
  {
    what: 'a step of the path',
    play: async (writer, driver) => {
      await writer.clicks('Beat 2');
      await settled();
      await pathTo(driver, 'The story');
    },
  },
  {
    what: 'adding a scene',
    play: async (writer) => {
      await writer.clicks('Beat 2');
      await settled();
      await writer.addsASceneUnder('Beat 2');
    },
  },
];

describe('the motion of a move the app makes', () => {
  it.each(moves)('keeps every animation of $what within 400 ms, easing out', async ({ play }) => {
    const { driver, stage, writer } = pageWith(1);
    await stage.fresh();

    await play(writer, driver);
    const animations = moving();

    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      const timing = animation.effect!.getComputedTiming();
      expect(timing.endTime).toBeLessThanOrEqual(400);
      expect(easesOut(timing.easing)).toBe(true);
    }
  });

  describe('under reduced motion', () => {
    afterEach(async () => {
      await browser.commands.emulateReducedMotion('no-preference');
    });

    it.each(moves)('moves nothing for $what', async ({ play }) => {
      const { driver, stage, writer } = pageWith(1);
      await browser.commands.emulateReducedMotion('reduce');
      await stage.fresh();

      await play(writer, driver);

      expect(moving()).toEqual([]);
    });
  });
});

describe('the motion of the panel beside the graph', () => {
  it('slides in over 200 to 300 ms, easing out', async () => {
    const { stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.clicks('Beat 2');

    await writer.opensBeside('Beat 2');

    const sliding = moving().filter(
      (animation) => animation instanceof CSSTransition && animation.transitionProperty === 'width',
    );
    expect(sliding).not.toEqual([]);
    for (const animation of sliding) {
      const timing = animation.effect!.getComputedTiming();
      expect(timing.duration).toBeGreaterThanOrEqual(200);
      expect(timing.duration).toBeLessThanOrEqual(300);
      expect(easesOut(timing.easing)).toBe(true);
    }
  });

  it('slides out over 200 to 300 ms, easing out', async () => {
    const { stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.clicks('Beat 2');
    await writer.opensBeside('Beat 2');
    await settled();

    await writer.closesThePanel();

    const sliding = moving().filter(
      (animation) => animation instanceof CSSTransition && animation.transitionProperty === 'width',
    );
    expect(sliding).not.toEqual([]);
    for (const animation of sliding) {
      const timing = animation.effect!.getComputedTiming();
      expect(timing.duration).toBeGreaterThanOrEqual(200);
      expect(timing.duration).toBeLessThanOrEqual(300);
      expect(easesOut(timing.easing)).toBe(true);
    }
  });

  it('ends with every visible card where a pane narrowed at rest puts it, with the panel open', async () => {
    const withPanel = pageWith(1);
    await withPanel.stage.fresh();
    await withPanel.writer.clicks('Beat 2');
    await withPanel.writer.opensBeside('Beat 2');
    await settled();
    await laidOut();
    await settled();
    const opened = boxes();

    const atRest = pageWith(1);
    await atRest.stage.fresh();
    await atRest.writer.clicks('Beat 2');
    narrowThePane(880);
    await laidOut();
    await settled();
    await laidOut();
    await settled();

    expect(boxes()).toEqual(opened);
  });

  describe('under reduced motion', () => {
    afterEach(async () => {
      await browser.commands.emulateReducedMotion('no-preference');
    });

    it('opens the panel in one step', async () => {
      const { stage, writer } = pageWith(1);
      await browser.commands.emulateReducedMotion('reduce');
      await stage.fresh();
      await writer.clicks('Beat 2');

      await writer.opensBeside('Beat 2');

      expect(moving()).toEqual([]);
      expect(widthOf(panelOf())).toBe(560);
    });
  });
});

describe('the app’s language', () => {
  it('refuses a scene that is not under the beat named', async () => {
    const { driver, stage, sees, writer } = pageWith(2);
    await stage.fresh();
    await driver.click('heading', 'Beat 4', { role: 'group', name: 'Beat 4' });
    const type = appSteps(writer, sees)[typed]!;

    await expect(
      Promise.resolve(type({ text: 'Maren rows out', scene: 'Scene 1', beat: 'Beat 2' })),
    ).rejects.toThrow('Scene 1 is not under Beat 2');
  });
});

const files = (import.meta as unknown as RawGlob).glob('/src/ui/app/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

playScenarioFiles(files, () => vitestBrowserDriver(undefined, 'page'), appScenarioSteps);
