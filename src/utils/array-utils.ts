export const findIndexInArray = <T extends { index: number }>(
  array: T[],
  index: number
) => {
  return array.findIndex((item) => item.index === index);
};
