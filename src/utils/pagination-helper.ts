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

// export const shouldPrefetchNextBatch = <T extends { index: number }>(
//   itemList: T[] | undefined,
//   itemCount: number | undefined,
//   index: number,
//   nextIndex: number,
//   threshold: number,
//   batchSize: number
// ): [boolean, number] => {
//   if (!itemList || !itemCount || nextIndex >= itemCount) return [false, 0];
//   const dif = nextIndex - index;

//   const dir = Math.sign(dif);
//   const clampedIndex = Math.min(
//     Math.max(nextIndex + dir * (threshold + 1), 0),
//     itemCount
//   );

//   if (
//     nextIndex - 1 < threshold ||
//     nextIndex - 1 > itemList.length - 1 - threshold
//   ) {
//     console.log("triggered");
//     const isLoaded = Boolean(
//       itemList.find((item) => item.index === clampedIndex )
//     );
//     if (isLoaded) return [false, 0];

//     const isLoaded2 = Boolean(
//       itemList.find((item) =>  item.index ===nextIndex)
//     );
//     if (!isLoaded2) return [true , Math.floor((nextIndex - 1) / batchSize)];
//     const batchIndex = Math.floor((nextIndex - 1) / batchSize) + 1;

//     return [true, batchIndex];
//   }
//   return [false, 0];
// };

export const shouldPrefetchNextBatch = <T extends { index: number }>(
  itemList: T[] | undefined,
  itemCount: number | undefined,
  index: number,
  nextIndex: number,
  threshold: number,
  batchSize: number
): [boolean, number] => {
  // Return false if itemList or itemCount is undefined, or nextIndex is greater than itemCount.
  if (!itemList || !itemCount || nextIndex > itemCount) {
    return [false, 0];
  }

  // Calculate the difference and direction between the current index and the next index.
  const difference = nextIndex - index;
  const direction = Math.sign(difference);

  // Clamp the index of the item to prefetch to be within the list bounds.
  const clampedIndex = Math.min(
    Math.max(nextIndex + direction * (threshold + 1), 0),
    itemCount
  );

  // Check if the item to prefetch is close to the start or end of the list.
  if (
    nextIndex - 1 < threshold ||
    nextIndex - 1 > itemList.length - 1 - threshold
  ) {
    // Check if the item to prefetch is already loaded.
    if (itemList.some((item) => item.index === clampedIndex)) {
      return [false, 0];
    }

    // Check if the current batch needs to be loaded, and return its index.
    if (!itemList.some((item) => item.index === nextIndex)) {
      const batchIndex = Math.floor((nextIndex - 1) / batchSize);
      return [true, batchIndex];
    }

    // Return the index of the next batch to load.
    const batchIndex = Math.floor((nextIndex - 1) / batchSize) + 1;
    return [true, batchIndex];
  }

  // Check if the current batch needs to be loaded, and return its index.
  if (!itemList.some((item) => item.index === nextIndex)) {
    const batchIndex = Math.floor((nextIndex - 1) / batchSize);
    return [true, batchIndex];
  }

  // Return false if no prefetch is needed.
  return [false, 0];
};
