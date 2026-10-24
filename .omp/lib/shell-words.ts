/* shortcut: substitution and escapes are not read, so a command another shell builds is not
   caught; read them once a session is seen to hide a command behind one. */
export const wordsPerCommand = (line: string): string[][] => {
  const commands: string[][] = [];
  let words: string[] = [];
  let word = '';
  let quote = '';
  let droppingTarget = false;
  const endWord = () => {
    if (word === '') return;
    if (!droppingTarget) words.push(word);
    word = '';
    droppingTarget = false;
  };
  const endCommand = () => {
    endWord();
    if (words.length > 0) commands.push(words);
    words = [];
    droppingTarget = false;
  };
  const operatorEnd = (index: number): number => {
    const start = line[index] === '&' ? index + 1 : index;
    let at = start + 1;
    if (line[at] === line[start]) at += 1;
    if (line[at] === '&') at += 1;
    return at;
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
      index = operatorEnd(index) - 1;
      droppingTarget = true;
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
