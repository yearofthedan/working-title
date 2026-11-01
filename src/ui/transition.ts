export const whileMeasuring = (transitioned: string, keepsVisibility: boolean): string =>
  transitioned
    .split(', ')
    .filter(
      (property) =>
        property !== 'width' &&
        property !== 'height' &&
        (keepsVisibility || property !== 'visibility'),
    )
    .join(', ');
