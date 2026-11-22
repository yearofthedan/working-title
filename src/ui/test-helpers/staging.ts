export const root = (tag: string): HTMLElement => {
  const element = document.createElement(tag);
  document.body.replaceChildren(element);
  return element;
};
