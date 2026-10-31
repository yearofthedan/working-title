import { afterEach, describe, expect, it } from 'vite-plus/test';
import * as browser from 'vite-plus/test/browser';
import { settled, type Driver } from '../../test-helpers/driver';
import { laidOut, moving, pageWith, recorded, partWay } from '../../test-helpers/graph-page';
import { arrivalStep, easesOut, movedBy } from '../../test-helpers/frames';
import { type Writer } from './graph.dsl';
import { cardAtCursor, everyCard, nameOf, focused, named } from '../../test-helpers/measuring';
import { narrowThePane } from '../../test-helpers/staging';

const boxes = (): readonly string[] =>
  everyCard().map((card) => {
    const box = card.getBoundingClientRect();
    return `${nameOf(card)} ${box.left} ${box.top} ${box.width} ${box.height}`;
  });

const pathTo = (driver: Driver, piece: string): Promise<void> =>
  driver.click('button', piece, { role: 'navigation', name: 'Where you are' });

const moves: ReadonlyArray<{
  readonly what: string;
  readonly play: (writer: Writer, driver: Driver) => Promise<void>;
}> = [
  {
    what: 'a click on a card',
    play: async (writer) => {
      await writer.clicks('Beat 2');
    },
  },
  {
    what: 'a click on a chip',
    play: async (writer) => {
      await writer.clicks('Beat 2');
      await settled();
      await writer.clicks('Beat 5');
    },
  },
  {
    what: 'an arrow key',
    play: async (writer, driver) => {
      await writer.clicks('Beat 2');
      await settled();
      await driver.press('ArrowRight');
    },
  },
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

describe('the motion of a move', () => {
  it.each(moves)('keeps every animation of $what within 400 ms, easing out', async ({ play }) => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();

    await play(writer, driver);
    const animations = moving();

    expect(animations.length).toBeGreaterThan(0);
    for (const animation of animations) {
      const timing = animation.effect!.getComputedTiming();
      expect(timing.endTime).toBeLessThanOrEqual(400);
      expect(easesOut(timing.easing)).toBe(true);
    }
  });

  it('draws the page without moving anything', async () => {
    const { driver } = pageWith(1);
    await driver.fresh();

    expect(moving()).toEqual([]);
  });

  it('keeps a piece leaving the graph out of reach while it fades', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();
    await writer.clicks('Beat 4');
    await settled();

    await pathTo(driver, 'The story');
    const leaving = named('hidden', 'Scene 1');

    for (let at = 0; at < 12; at += 1) {
      await driver.press('Tab');
      expect(cardAtCursor()).not.toBe(leaving);
    }

    await browser.userEvent.click(leaving, { force: true });
    expect(nameOf(focused())).not.toBe('Scene 1');
  });

  it('resizes part-way through a move without cutting it short, ending where a resize at rest does', async () => {
    const atRest = pageWith(1);
    await atRest.driver.fresh();
    await atRest.writer.clicks('Beat 2');
    await settled();
    narrowThePane(720);
    await laidOut();
    await settled();
    const rest = boxes();

    const partWay = pageWith(1);
    await partWay.driver.fresh();
    await partWay.writer.clicks('Beat 2');
    narrowThePane(720);
    await laidOut();
    expect(moving().length).toBeGreaterThan(0);
    await settled();
    await laidOut();
    await settled();

    expect(boxes()).toEqual(rest);
  });

  it('keeps a move made during a move running, and comes to rest without a jump', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();

    const frames = await recorded(async () => {
      await writer.clicks('Beat 2');
      await partWay();
      await driver.press('ArrowRight');
      await settled();
    });

    const first = frames.find((frame) => frame.running > 0)!;
    expect(frames.some((frame) => frame.at > first.at + 270 && frame.running > 0)).toBe(true);
    expect(arrivalStep(frames)).toBeLessThan(10);
  });

  it('starts a second move part-way through the first without jumping a card', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();

    let pressed = 0;
    const frames = await recorded(async () => {
      await writer.clicks('Beat 2');
      await laidOut();
      pressed = performance.now();
      await driver.press('ArrowRight');
      await settled();
    });

    const story = nameOf(named('card', 'The story'));
    const before = frames.findLast((frame) => frame.at <= pressed)!;
    const after = frames.find((frame) => frame.at > pressed)!;
    const landing = frames.at(-1)!;

    const step = movedBy(before, after, story);
    const stillToGo = movedBy(before, landing, story);

    expect(step).toBeLessThan(stillToGo / 2);
  });

  it('takes a click and a key while a move runs, each landing on the piece it aims at and running to its end', async () => {
    const { driver, writer } = pageWith(1);
    await driver.fresh();

    const landed: string[] = [];
    let clicked = 0;
    let pressed = 0;
    const clickFrames = await recorded(async () => {
      await writer.clicks('Beat 2');
      await partWay();
      clicked = performance.now();
      await browser.userEvent.click(named('chip', 'Beat 5'), { force: true });
      landed.push(nameOf(focused()));
      await settled();
    });
    const keyFrames = await recorded(async () => {
      await driver.press('ArrowLeft');
      await partWay();
      pressed = performance.now();
      await driver.press('ArrowLeft');
      landed.push(nameOf(focused()));
      await settled();
    });

    expect(landed).toEqual(['Beat 5', 'Beat 3']);
    const afterClick = clickFrames.filter((frame) => frame.at > clicked && frame.running > 0);
    const afterKey = keyFrames.filter((frame) => frame.at > pressed && frame.running > 0);
    expect((afterClick.at(-1)?.at ?? clicked) - clicked).toBeGreaterThan(160);
    expect((afterKey.at(-1)?.at ?? pressed) - pressed).toBeGreaterThan(160);
  });

  describe('under reduced motion', () => {
    afterEach(async () => {
      await browser.commands.emulateReducedMotion('no-preference');
    });

    it.each(moves)('moves nothing for $what', async ({ play }) => {
      const { driver, writer } = pageWith(1);
      await browser.commands.emulateReducedMotion('reduce');
      await driver.fresh();

      await play(writer, driver);

      expect(moving()).toEqual([]);
    });
  });
});
