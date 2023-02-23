export function getNextBatch<T extends { id: string }>(
  currentItems: T[],
  nextPage: number,
  batchSize: number,
  treshold: number
): [number, boolean] {
  const batchIndex = Math.floor((nextPage - 1) / batchSize) + 1;
  const pagesLeftInBatch = batchSize - (nextPage % batchSize || batchSize);
  const shouldFetchNextBatch = pagesLeftInBatch < treshold;
  return [batchIndex, shouldFetchNextBatch];
}
type Mathsign = 1 | -1 | 0;
export const shouldPrefetch = <T extends { id: string }>(
  itemList: T[] | undefined,
  index: number,
  nextIndex: number,
  threshold: number
): Mathsign => {
  if (!itemList || nextIndex >= itemList.length) return 0;
  const dir = nextIndex - index;

  if (Math.abs(dir) > threshold) {
    return 0;
  }
  // const clampedIndex = Math.min(Math.max(index + dir * 2, 0), itemList.length);

  return Math.sign(dir) as Mathsign;
};
