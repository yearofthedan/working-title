import type { Step } from './scenario-file';

export type StepAction = (vars: Record<string, string>) => Promise<void> | void;

const literal = (part: string): string => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const patternFor = (phrase: string): RegExp => {
  if (phrase.trim() === '') throw new Error('An action needs a phrase to answer');
  const names = new Set<string>();
  const body = phrase
    .split(/(\{[^}]*\})/)
    .map((part) => {
      if (part.startsWith('{')) {
        if (!/^\{[A-Za-z]\w*\}$/.test(part)) {
          throw new Error(
            `A phrase's placeholder reads {name}, and ${JSON.stringify(part)} in ${JSON.stringify(phrase)} does not`,
          );
        }
        const name = part.slice(1, -1);
        if (names.has(name)) {
          throw new Error(`A phrase uses {${name}} twice: ${JSON.stringify(phrase)}`);
        }
        names.add(name);
        return phrase.includes(`"{${name}}"`) ? `(?<${name}>.*)` : `(?<${name}>.+)`;
      }
      if (/[{}]/.test(part)) {
        throw new Error(`A phrase's placeholder reads {name}: ${JSON.stringify(phrase)}`);
      }
      return literal(part);
    })
    .join('');
  return new RegExp(`^${body}$`);
};

export const stepTable = (actions: Readonly<Record<string, StepAction>>) => {
  const entries = Object.entries(actions).map(([phrase, action]) => ({
    phrase,
    action,
    pattern: patternFor(phrase),
  }));

  const play = async (step: Step): Promise<void> => {
    const played = entries.flatMap(({ phrase, action, pattern }) => {
      const found = pattern.exec(step.phrase);
      return found ? [{ phrase, action, vars: { ...found.groups } }] : [];
    });

    if (played.length === 0) {
      throw new Error(`Nothing plays the phrase ${JSON.stringify(step.phrase)}`);
    }
    if (played.length > 1) {
      const phrases = played.map(({ phrase }) => JSON.stringify(phrase)).join(' and ');
      throw new Error(
        `${played.length} actions play the phrase ${JSON.stringify(step.phrase)}: ${phrases}`,
      );
    }

    const [only] = played;
    await only?.action(only.vars);
  };

  return { play };
};
