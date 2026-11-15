const refusedInAName = /["*/:<>?\\|\p{Cc}\p{Cf}]/gu;
const reserved = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

export const folderNameFor = (title: string): string => {
  const name = title
    .replace(refusedInAName, ' ')
    .replace(/^[\s.~]+|[\s.~]+$/g, '')
    .replace(/\s+/g, ' ');
  if (reserved.test(name)) return `${name} project`;
  return name === '' ? 'Untitled project' : name;
};
