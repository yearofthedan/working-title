import { untitledProjectTitle } from '../domain/project';

const refusedInAName = /["*/:<>?\\|\p{Cc}\p{Cf}\p{Noncharacter_Code_Point}]/gu;
const deviceOnWindows = /^(con|prn|aux|nul|com[1-9]|lpt[1-9]|clock\$)(?=\.|$)/i;
const wholeNameOnWindows = /^(desktop\.ini|thumbs\.db|conin\$|conout\$)$/i;
const classIdExtension = /^\{.*\}$/;
const refusedExtensions = /^(lnk|scf|url|cfg|dll|dng|ini|manifest)$/;

const refusesItsExtension = (name: string): boolean => {
  const lastDot = name.lastIndexOf('.');
  if (lastDot === -1) return false;
  const extension = name.slice(lastDot + 1).toLowerCase();
  return (
    extension !== 'local' && (refusedExtensions.test(extension) || classIdExtension.test(extension))
  );
};

const lastDotAsASpace = (name: string): string => {
  const lastDot = name.lastIndexOf('.');
  return `${name.slice(0, lastDot)} ${name.slice(lastDot + 1)}`;
};

export const folderNameFor = (title: string): string => {
  const name = title
    .replace(refusedInAName, ' ')
    .replace(/^[\s.~]+|[\s.~]+$/g, '')
    .replace(/\s+/g, ' ');
  if (name === '') return untitledProjectTitle;
  const reserved = wholeNameOnWindows.test(name)
    ? `${name} project`
    : name.replace(deviceOnWindows, '$1 project');
  return refusesItsExtension(reserved) ? lastDotAsASpace(reserved) : reserved;
};
