export const heightOf = (element: Element): number => element.getBoundingClientRect().height;

export const leftOf = (element: Element): number => element.getBoundingClientRect().left;

export const boxOf = (element: Element): string => {
  const { left, top, width, height } = element.getBoundingClientRect();
  return `${left} ${top} ${width} ${height}`;
};

export const widthOf = (element: Element): number => element.getBoundingClientRect().width;

export const topOf = (element: Element): number => element.getBoundingClientRect().top;

export const bottomOf = (element: Element): number => element.getBoundingClientRect().bottom;

export const rightOf = (element: Element): number => element.getBoundingClientRect().right;
