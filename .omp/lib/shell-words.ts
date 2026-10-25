type Command = { words: string[]; targets: string[] };

/* shortcut: substitution and escapes are not read, so a command another shell builds is not
   caught; read them once a session is seen to hide a command behind one. */
const commandsIn = (line: string): Command[] => {
  const commands: Command[] = [];
  let command: Command = { words: [], targets: [] };
  let word = '';
  let quote = '';
  let dropped = false;
  let target = false;
  const endWord = () => {
    if (word === '') return;
    if (!dropped) command.words.push(word);
    else if (target) command.targets.push(word);
    word = '';
    dropped = false;
    target = false;
  };
  const endCommand = () => {
    endWord();
    commands.push(command);
    command = { words: [], targets: [] };
    dropped = false;
    target = false;
  };
  const operatorEnd = (index: number): { at: number; writes: boolean } => {
    const ampersand = line[index] === '&';
    const start = ampersand ? index + 1 : index;
    const writes = line[start] === '>';
    let at = start + 1;
    if (line[at] === line[start]) at += 1;
    const copy = !ampersand && line[at] === '&' && /^[0-9-]/.test(line[at + 1] ?? '');
    if (line[at] === '|' || line[at] === '&') at += 1;
    return { at, writes: writes && !copy };
  };
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index] as string;
    if (quote !== '') {
      if (character === quote) quote = '';
      else word += character;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (
      character === '>' ||
      character === '<' ||
      (character === '&' && line[index + 1] === '>')
    ) {
      if (/^[0-9]+$/.test(word)) word = '';
      else endWord();
      const operator = operatorEnd(index);
      index = operator.at - 1;
      dropped = true;
      target = operator.writes;
    } else if (character === '&' || character === '|' || character === ';') {
      endCommand();
    } else if (/\s/.test(character)) {
      endWord();
    } else {
      word += character;
    }
  }
  endCommand();
  return commands;
};

export const wordsPerCommand = (line: string): string[][] =>
  commandsIn(line)
    .map(({ words }) => words)
    .filter((words) => words.length > 0);

export const writeTargetsPerCommand = (line: string): string[][] =>
  commandsIn(line)
    .map(({ targets }) => targets)
    .filter((targets) => targets.length > 0);
