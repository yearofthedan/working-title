export const svgIn = (name: string, attributes: Readonly<Record<string, string>>): SVGElement => {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
};
