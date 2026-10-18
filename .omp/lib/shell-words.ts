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
  // A redirection is the shell's, not the command's, so the operator and its target
  // are dropped: `git push … 2>&1` reaches the command as `git push …`. The file
  // descriptor counts only where it touches the operator, as bash reads it
  // ([redirections](https://www.gnu.org/software/bash/manual/bash.html#Redirections)).
  const pastRedirection = (index: number): number => {
    let at = index;
    while (/[0-9]/.test(line[at] ?? '')) at += 1;
    const operator = line[at] === '&' ? at + 1 : at;
    at = operator + 1;
    if (line[at] === line[operator]) at += 1;
    if (line[at] === '&') {
      at += 1;
      while (/[0-9]/.test(line[at] ?? '')) at += 1;
      if (line[at] === '-') at += 1;
      return at;
    }
    while (/[^\s&|;]/.test(line[at] ?? '')) at += 1;
    while (/\s/.test(line[at] ?? '')) at += 1;
    while (/[^\s&|;]/.test(line[at] ?? '')) at += 1;
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
      index = pastRedirection(index) - 1;
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
