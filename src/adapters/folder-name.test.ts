import { describe, expect, it } from 'vite-plus/test';
import { folderNameFor } from './folder-name';

const source =
  'https://github.com/chromium/chromium/blob/9e9c708ce464b92f1ef27cc61d4867d647220e05/content/browser/file_system_access/file_system_access_manager_impl.cc#L2557';

describe(`folderNameFor, by the rule Chromium refuses a folder name by (${source})`, () => {
  it.each([
    ['The Ferryman', 'The Ferryman'],
    ['«Начало»', '«Начало»'],
    ['終わり', '終わり'],
  ])('leaves the title %s as it is, which a folder name can hold', (title, name) => {
    expect(folderNameFor(title)).toBe(name);
  });

  it.each(['"', '*', '/', ':', '<', '>', '?', '\\', '|'])('turns %s into a space', (character) => {
    expect(folderNameFor(`Salt${character}Year`)).toBe('Salt Year');
  });

  it.each([
    ['a null', '\u0000'],
    ['a unit separator', '\u001f'],
    ['delete', '\u007f'],
    ['the first character of the second control block', '\u0080'],
    ['the last control character', '\u009f'],
    ['a line break', '\n'],
    ['a tab', '\t'],
    ['a soft hyphen, which is a formatting character', '\u00ad'],
    ['a left-to-right mark', '\u200e'],
    ['a zero-width space', '\u200b'],
    ['a right-to-left override', '\u202e'],
    ['a byte-order mark', '\ufeff'],
  ])('turns %s into a space', (_, character) => {
    expect(folderNameFor(`Salt${character}Year`)).toBe('Salt Year');
  });

  it.each([
    ['a space', '  The Ferryman  '],
    ['a dot', '.The Ferryman.'],
    ['a tilde', '~The Ferryman~'],
    ['a run of them', ' . ~The Ferryman~ . '],
  ])('trims %s from both ends', (_, title) => {
    expect(folderNameFor(title)).toBe('The Ferryman');
  });

  it('collapses the whitespace inside a title to one space', () => {
    expect(folderNameFor('The   Ferryman\t of \nthe river')).toBe('The Ferryman of the river');
  });

  it.each([
    ['CON', 'CON project'],
    ['con', 'con project'],
    ['Con', 'Con project'],
    ['PRN', 'PRN project'],
    ['AUX', 'AUX project'],
    ['NUL', 'NUL project'],
    ['COM1', 'COM1 project'],
    ['COM9', 'COM9 project'],
    ['LPT1', 'LPT1 project'],
    ['LPT9', 'LPT9 project'],
  ])('names the reserved name %s "%s"', (title, name) => {
    expect(folderNameFor(title)).toBe(name);
  });

  it.each([
    ['COM10', 'COM10'],
    ['LPT0', 'LPT0'],
    ['CONSOLE', 'CONSOLE'],
  ])('leaves %s alone, which Windows keeps', (title, name) => {
    expect(folderNameFor(title)).toBe(name);
  });

  it.each([
    ['no title at all', ''],
    ['whitespace alone', '   '],
    ['only the characters a folder name cannot hold', '"*/:<>?\\|'],
    ['only what is trimmed away', '.~ '],
  ])('names a title with %s "Untitled project"', (_, title) => {
    expect(folderNameFor(title)).toBe('Untitled project');
  });
});
