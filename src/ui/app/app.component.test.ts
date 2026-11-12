import { afterEach, describe, expect, it } from 'vite-plus/test';
import { commands } from 'vite-plus/test/browser';
import { bottomOf, boxOf, heightOf, topOf, widthOf } from '../../test-helpers/box';
import { settled } from '../../test-helpers/driver';
import { easesOut } from '../../test-helpers/frames';
import { caretOf } from '../../test-helpers/field';
import { laidOut, moving } from '../../test-helpers/graph-page';
import { expectVisuallyHidden, expectVisuallyShown } from '../../test-helpers/look';
import type { RawGlob } from '../../test-helpers/raw-glob';
import { playScenarioFiles } from '../../test-helpers/scenario-entry';
import { anInMemoryProject, holdingSaves } from '../../test-helpers/seed';
import { aPageWithoutAHeader, aPageWithoutAMain, narrowThePane } from '../../test-helpers/staging';
import { vitestBrowserDriver } from '../../test-helpers/vitest-browser.driver';
import { nameOf, theCard, timesDrawn } from '../card/card.test-page';
import { everyCard } from '../graph/graph.test-page';
import { thePanelOn } from '../panel/panel.test-page';
import { renderApp } from './app.dom';
import { type AppWriter } from './app.dsl';
import { appScenarioSteps, pageWith, theAppWaitingForANewVersion } from './app.harness';
import { theHeader } from './app.test-page';

const theStory = "A widow hunts the man who sank her husband's ship";

const boxes = (): readonly string[] => everyCard().map((card) => `${nameOf(card)} ${boxOf(card)}`);

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
});

describe('a new version waiting', () => {
  it('shows the writer a way to reload once a new version is ready to run', async () => {
    const waiting = Promise.withResolvers<void>();
    await theAppWaitingForANewVersion({ waiting: waiting.promise, reload: () => undefined });

    const { notice, noticeReload } = theHeader();
    await expect.element(notice).toBeEmptyDOMElement();
    await expect.element(noticeReload).not.toBeInTheDocument();

    waiting.resolve();

    await expect.element(notice).toHaveTextContent('A new version is ready. Reload');
    await expect.element(noticeReload).toBeInTheDocument();
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

    expect(timesDrawn(theCard('The story').card.element(), theStory)).toBe(1);
  });
});

describe('what the app keeps', () => {
  it('writes nothing to storage', async () => {
    const { stage, store, writer } = pageWith();
    await stage.fresh();
    await writer.types("Maren finds the ship's log", {
      piece: 'Beat 2',
      facet: 'One-sentence summary',
    });
    const before = await store.load();
    expect(before).not.toBeUndefined();

    await writer.moves('→');
    await writer.moves('↑');
    await writer.clicks('Beat 1');

    expect(await store.load()).toBe(before);
  });

  it('opens on the story when the page is drawn again', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await expect.element(theCard('Beat 2').card).toHaveAttribute('aria-current', 'location');

    await stage.reopen();

    await expect.element(theCard('The story').card).toHaveAttribute('aria-current', 'location');
  });

  it('opens with nothing beside the graph when the page is drawn again', async () => {
    const { stage, writer, sees } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();

    await stage.reopen();

    await sees.noPanelIsOpen();
  });

  it('saves a sentence typed into a card after clicking it, read back by a fresh page', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    const sentence = "Maren finds the ship's log";
    await writer.types(sentence, { piece: 'Beat 4', facet: 'One-sentence summary' });

    await stage.reopen();
    await writer.clicks('Beat 4');

    await expect.element(theCard('Beat 4').field('One-sentence summary')).toHaveValue(sentence);
  });

  it('keeps the text and the caret when a save is slow', async () => {
    const store = holdingSaves();
    const { stage, writer } = pageWith(0, 1440, store);
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();
    const paragraph = thePanelOn('Beat 2').field('Paragraph');

    await writer.putsTheFocusIn('Paragraph');
    await writer.typesKeyByKey('ab');
    await writer.presses('ArrowLeft');
    await writer.typesKeyByKey('X');

    store.release();

    await expect.element(paragraph).toHaveValue('aXb');
    await settled();
    expect(caretOf(paragraph)).toBe(2);
  });
});

describe('the path in the header', () => {
  it("leaves the cursor on the new current piece's card after a path click", async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 4');
    await expect.element(theCard('Beat 4').card).toHaveAttribute('aria-current', 'location');
    await expect.element(theCard('Beat 4').card).toHaveFocus();

    await writer.clicksThePathTo('The story');

    await expect.element(theCard('The story').card).toHaveAttribute('aria-current', 'location');
    await expect.element(theCard('The story').card).toHaveFocus();
  });
});

describe('the arrow keys on the page', () => {
  it('moves to the next beat with nothing focused right after the app opens', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();

    await writer.moves('↓');
    await writer.clicksAwayFromTheGraph();
    await writer.moves('→');

    await expect.element(theCard('Beat 2').card).toHaveAttribute('aria-current', 'location');
  });

  it('moves to the next beat with nothing focused after clicking a card and clicking away', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();

    await writer.clicks('Beat 2');
    await writer.clicksAwayFromTheGraph();
    await writer.moves('→');

    await expect.element(theCard('Beat 3').card).toHaveAttribute('aria-current', 'location');
  });

  it('moves a level down with the focus on a path button in the header', async () => {
    const { stage, writer } = pageWith(1);
    await stage.fresh();
    await writer.clicks('Beat 4');
    await writer.presses('ArrowDown');
    await writer.clicksThePathTo('Beat 4');
    await writer.tabsBackward();
    await writer.tabsBackward();

    await writer.moves('↓');

    await expect.element(theCard('Scene 1').card).toHaveAttribute('aria-current', 'location');
  });

  it('leaves the current piece where it is with the focus in the panel', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();

    await writer.moves('→');

    await expect.element(theCard('Beat 2').card).toHaveAttribute('aria-current', 'location');
  });

  it('moves exactly one step with the focus on a card', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');

    await writer.moves('→');

    await expect.element(theCard('Beat 3').card).toHaveAttribute('aria-current', 'location');
  });
});

describe('opening a piece beside the graph', () => {
  it('puts the focus inside the panel when a beat opens beside the graph', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();

    await writer.opensBeside('Beat 2');

    await expect.element(thePanelOn('Beat 2').field('One-sentence summary')).toHaveFocus();
  });

  it('keeps the icon of the beat beside pressed, and unpressed once it is closed', async () => {
    const { stage, writer, sees } = pageWith();
    await stage.fresh();

    await writer.opensBeside('Beat 2');
    const icon = theCard('Beat 2').actions.openBeside;
    await expect.element(icon).toHaveAttribute('aria-pressed', 'true');

    await writer.closesThePanel();

    await expect.element(icon).toHaveAttribute('aria-pressed', 'false');
    await sees.noPanelIsOpen();
  });

  it('closes the panel when the lit icon is clicked again', async () => {
    const { stage, writer, sees } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');

    await writer.clicksOpenBesideOn('Beat 2');

    await sees.noPanelIsOpen();
  });

  it('runs the panel the full height of the page, past the header', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();

    const panel = thePanelOn('Beat 2').panel;
    const { header } = theHeader();

    expect(topOf(panel.element())).toBe(0);
    expect(heightOf(panel.element())).toBe(window.innerHeight);
    expect(topOf(header.element())).toBeGreaterThanOrEqual(topOf(panel.element()));
    expect(bottomOf(header.element())).toBeLessThanOrEqual(bottomOf(panel.element()));
  });

  it('leaves the focus on the Close button when an arrow key is pressed there', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();
    await writer.putsTheFocusOnClose();

    await writer.presses('ArrowRight');

    await expect.element(thePanelOn('Beat 2').actions.close).toHaveFocus();
    await expect.element(theCard('Beat 2').card).toHaveAttribute('aria-current', 'location');
  });

  it('puts the focus back on the icon that opened it, and on the focus card when that beat is a chip', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();

    await writer.closesThePanel();

    await expect.element(theCard('Beat 2').actions.openBeside).toHaveFocus();

    await writer.opensBeside('Beat 2');
    await writer.clicks('Beat 4');
    await settled();

    await writer.closesThePanel();

    await expect.element(theCard('Beat 4').card).toHaveFocus();
  });

  it('closes the panel on Esc, putting the focus back on the icon', async () => {
    const { stage, writer, sees } = pageWith();
    await stage.fresh();
    await writer.opensBeside('Beat 2');
    await settled();
    await writer.putsTheFocusOnClose();

    await writer.presses('Esc');

    await sees.noPanelIsOpen();
    await expect.element(theCard('Beat 2').actions.openBeside).toHaveFocus();
  });

  it('shows the icon while the pointer is over the card or the focus is within it, and draws none on a chip or the story card', async () => {
    const { stage, writer } = pageWith();
    await stage.fresh();
    await writer.clicks('Beat 2');
    await settled();
    await writer.clicksAwayFromTheGraph();
    const icon = theCard('Beat 2').actions.openBeside;

    await writer.hovers('The story');
    await expectVisuallyHidden(icon);

    await writer.hovers('Beat 2');
    await expectVisuallyShown(icon);

    await writer.hovers('The story');
    await expectVisuallyHidden(icon);

    await writer.clicks('Beat 2');
    await writer.hovers('The story');
    await expectVisuallyShown(icon);

    await writer.hovers('Beat 1');
    await expect.element(theCard('Beat 1').actions.openBeside).not.toBeVisible();

    await writer.hovers('The story');
    await expect.element(theCard('The story').actions.openBeside).not.toBeInTheDocument();
  });

  it('keeps a scene open beside the graph while the focus moves off it', async () => {
    const { stage, writer, sees } = pageWith(1);
    await stage.fresh();
    await writer.makesCurrent('Beat 4');
    await writer.opensBeside('Scene 1');
    await settled();

    await writer.makesCurrent('The story');
    await settled();

    await sees.panelIsOpenOn('Scene 1');
  });

  it('replaces the beat beside the graph when a scene opens', async () => {
    const { stage, writer, sees } = pageWith(1);
    await stage.fresh();
    await writer.makesCurrent('Beat 4');
    await writer.opensBeside('Beat 4');
    await settled();

    await writer.opensBeside('Scene 1');
    await settled();

    await sees.panelIsOpenOn('Scene 1');
    await expect.element(thePanelOn('Scene 1').field('Narrative')).toBeInTheDocument();
    await expect.element(thePanelOn('Scene 1').field('Page')).not.toBeInTheDocument();
  });

  it('replaces the scene beside the graph when a beat opens', async () => {
    const { stage, writer, sees } = pageWith(1);
    await stage.fresh();
    await writer.makesCurrent('Beat 4');
    await writer.opensBeside('Scene 1');
    await settled();

    await writer.clicksOpenBesideOn('Beat 4');
    await settled();

    await sees.panelIsOpenOn('Beat 4');
    await expect.element(thePanelOn('Beat 4').field('Page')).toBeInTheDocument();
    await expect.element(thePanelOn('Beat 4').field('Narrative')).not.toBeInTheDocument();
  });
});

const moves: ReadonlyArray<{
  readonly what: string;
  readonly play: (writer: AppWriter) => Promise<void>;
}> = [
  {
    what: 'a step of the path',
    play: async (writer) => {
      await writer.clicks('Beat 2');
      await settled();
      await writer.clicksThePathTo('The story');
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
    const { stage, writer } = pageWith(1);
    await stage.fresh();

    await play(writer);
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
      await commands.emulateReducedMotion('no-preference');
    });

    it.each(moves)('moves nothing for $what', async ({ play }) => {
      const { stage, writer } = pageWith(1);
      await commands.emulateReducedMotion('reduce');
      await stage.fresh();

      await play(writer);

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
      await commands.emulateReducedMotion('no-preference');
    });

    it('opens the panel in one step', async () => {
      const { stage, writer } = pageWith(1);
      await commands.emulateReducedMotion('reduce');
      await stage.fresh();
      await writer.clicks('Beat 2');

      await writer.opensBeside('Beat 2');

      expect(moving()).toEqual([]);
      expect(widthOf(thePanelOn('Beat 2').panel.element())).toBe(560);
    });
  });
});

const files = (import.meta as unknown as RawGlob).glob('/src/ui/app/scenarios/*.approved.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

playScenarioFiles(files, () => vitestBrowserDriver(undefined, 'page'), appScenarioSteps);
