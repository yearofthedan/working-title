// Split a shell command line into its commands, each a list of words.

// Substitution and escapes are not read, so a command another shell builds is not caught.
export const wordsPerCommand = (line: string): string[][] => {
  const commands: string[][] = [];
  let words: string[] = [];
  let word = '';
  let quote = '';
  const endWord = () => {
    if (word !== '') words.push(word);
    word = '';
  };
  const endCommand = () => {
    endWord();
    if (words.length > 0) commands.push(words);
    words = [];
  };
  for (const character of line) {
    if (quote !== '') {
      if (character === quote) quote = '';
      else word += character;
    } else if (character === '"' || character === "'") {
      quote = character;
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
