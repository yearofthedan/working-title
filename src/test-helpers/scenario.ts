type Keyword = 'Given' | 'When' | 'Then';

const onePhrase = (phrase: string): string => {
  if (phrase.trim() === '' || /[\r\n]/.test(phrase)) {
    throw new Error(`A scenario line is one non-empty line, not ${JSON.stringify(phrase)}`);
  }
  return phrase;
};

export class Scenario {
  readonly #lines: string[] = [];

  constructor(readonly behaviour: string) {
    onePhrase(behaviour);
  }

  Given(phrase: string): this {
    return this.#step('Given', phrase);
  }

  When(phrase: string): this {
    return this.#step('When', phrase);
  }

  Then(phrase: string): this {
    return this.#step('Then', phrase);
  }

  And(phrase: string): this {
    if (this.#lines.length === 0) {
      throw new Error(`"and ${phrase}" needs a Given, When or Then before it`);
    }
    this.#lines.push(` └ and ${onePhrase(phrase)}`);
    return this;
  }

  get lines(): readonly string[] {
    return this.#lines;
  }

  #step(keyword: Keyword, phrase: string): this {
    this.#lines.push(`${keyword} ${onePhrase(phrase)}`);
    return this;
  }
}

export const printScenarios = (rule: string, scenarios: readonly Scenario[]): string =>
  [
    `Rule: ${onePhrase(rule)}`,
    ...scenarios.flatMap((scenario) => [
      '',
      `### Scenario: ${scenario.behaviour}`,
      '',
      '```',
      ...scenario.lines,
      '```',
    ]),
  ].join('\n') + '\n';
