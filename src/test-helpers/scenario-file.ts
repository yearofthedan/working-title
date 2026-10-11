export type StepKeyword = 'Given' | 'When' | 'Then' | 'And';

export interface Step {
  readonly keyword: StepKeyword;
  readonly phrase: string;
}

export interface Scenario {
  readonly behaviour: string;
  readonly steps: readonly Step[];
  /** What the runner observed, kept as it was written: the parser reads no meaning into it. */
  readonly observed?: readonly string[];
}

export interface ScenarioFile {
  readonly rule: string;
  readonly scenarios: readonly Scenario[];
}

const rank = { Given: 0, When: 1, Then: 2 } as const;

const stepLine = /^(Given|When|Then) (.+)$/;
const continuation = /^ └ and (.+)$/;

const stepIn = (line: string, soFar: readonly Step[], at: number): Step => {
  const plain = stepLine.exec(line);
  if (plain) {
    const keyword = plain[1] as keyof typeof rank;
    const last = [...soFar].reverse().find((step) => step.keyword !== 'And');
    if (last && keyword !== undefined && rank[keyword] < rank[last.keyword as keyof typeof rank]) {
      throw new Error(
        `Line ${at} is a ${keyword} after a ${last.keyword}: a scenario reads Given, When, Then`,
      );
    }
    return { keyword, phrase: plain[2] };
  }
  const and = continuation.exec(line);
  if (and) {
    if (soFar.length === 0) throw new Error(`Line ${at} is an "and" with no step before it`);
    return { keyword: 'And', phrase: and[1] };
  }
  throw new Error(`Line ${at} is not a step: ${JSON.stringify(line)}`);
};

const isStepLine = (line: string): boolean => stepLine.test(line) || continuation.test(line);

/**
 * A scenario file is the story template's acceptance criteria, copied as it was agreed: a rule
 * line, then per scenario a heading and a fenced block holding its steps and, after them, what
 * the runner observed.
 */
export const readScenarioFile = (text: string): ScenarioFile => {
  const lines = text.endsWith('\n') ? text.slice(0, -1).split('\n') : text.split('\n');
  const ruleLine = lines[0] ?? '';
  if (!ruleLine.startsWith('Rule: ')) {
    throw new Error(`A scenario file opens with "Rule: ", not ${JSON.stringify(ruleLine)}`);
  }

  const scenarios: Scenario[] = [];
  let steps: Step[] = [];
  let observed: string[] | undefined;
  let behaviour: string | undefined;
  let inFence = false;

  const close = () => {
    if (behaviour === undefined) return;
    scenarios.push({ behaviour, steps, ...(observed ? { observed } : {}) });
    steps = [];
    observed = undefined;
  };

  for (const [index, line] of lines.slice(1).entries()) {
    const at = index + 2;
    const heading = /^### Scenario: (.+)$/.exec(line);
    if (heading) {
      close();
      behaviour = heading[1];
      continue;
    }
    if (line === '```') {
      inFence = !inFence;
      continue;
    }
    if (line === '' && !inFence) continue;
    if (behaviour === undefined) {
      throw new Error(`Line ${at} is outside a scenario: ${JSON.stringify(line)}`);
    }
    if (!inFence) {
      throw new Error(
        `Line ${at} is inside a scenario outside its fenced block: ${JSON.stringify(line)}`,
      );
    }
    if (observed) {
      if (isStepLine(line)) {
        throw new Error(
          `Line ${at} is a step after what the runner observed: ${JSON.stringify(line)}`,
        );
      }
      observed.push(line);
      continue;
    }
    if (isStepLine(line)) {
      steps.push(stepIn(line, steps, at));
      continue;
    }
    observed = [line];
  }

  if (inFence) throw new Error('The last fenced block is not closed');
  close();
  if (scenarios.length === 0) throw new Error('A scenario file holds at least one scenario');
  return { rule: ruleLine.slice('Rule: '.length), scenarios };
};

export const printScenarioFile = ({ rule, scenarios }: ScenarioFile): string =>
  [
    `Rule: ${rule}`,
    ...scenarios.flatMap(({ behaviour, steps, observed }) => [
      '',
      `### Scenario: ${behaviour}`,
      '',
      '```',
      ...steps.map((step) =>
        step.keyword === 'And' ? ` └ and ${step.phrase}` : `${step.keyword} ${step.phrase}`,
      ),
      ...(observed ?? []),
      '```',
    ]),
  ].join('\n') + '\n';
