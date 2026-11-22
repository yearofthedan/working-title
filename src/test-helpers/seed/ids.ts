export const ids = (): (() => string) => {
  let made = 0;
  return () => `id-${(made += 1)}`;
};
