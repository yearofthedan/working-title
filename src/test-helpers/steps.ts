import type { Step } from './scenario-file';

export type StepMove = (vars: Record<string, string>) => Promise<void> | void;

const literal = (part: string): string => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** `the writer types {text} into {facet}` matches that phrase with those two words captured. */
const patternFor = (phrase: string): RegExp =>
  new RegExp(
    `^${phrase
      .split(/(\{\w+\})/)
      .map((part) => (/^\{\w+\}$/.test(part) ? `(?<${part.slice(1, -1)}>.+)` : literal(part)))
      .join('')}$`,
  );

/**
 * A writer move names the phrase it answers, and an unlockable scenario is refused rather than
 * played: a phrase no move matches, or one two moves claim, is a mistake in the file.
 */
export const stepTable = (moves: Readonly<Record<string, StepMove>>) => {
  const entries = Object.entries(moves).map(([phrase, move]) => ({
    phrase,
    move,
    pattern: patternFor(phrase),
  }));

  const play = async (step: Step): Promise<void> => {
    const matched = entries.flatMap(({ phrase, move, pattern }) => {
      const found = pattern.exec(step.phrase);
      return found ? [{ phrase, move, vars: { ...found.groups } }] : [];
    });

    if (matched.length === 0) {
      throw new Error(`No move answers the phrase ${JSON.stringify(step.phrase)}`);
    }
    if (matched.length > 1) {
      const phrases = matched.map(({ phrase }) => JSON.stringify(phrase)).join(' and ');
      throw new Error(`Two moves answer the phrase ${JSON.stringify(step.phrase)}: ${phrases}`);
    }

    const [only] = matched;
    await only?.move(only.vars);
  };

  return { play };
};
