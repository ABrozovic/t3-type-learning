export const shouldPrefetchNextBatch = (
  itemList: string[] | undefined,
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
    itemCount - 1
  );

  // Check if the item to prefetch is close to the start or end of the list.
  if (
    nextIndex > 3 &&
    (nextIndex - 1 < threshold ||
      nextIndex - 1 > itemList.length - 1 - threshold)
  ) {
    // Check if the current batch needs to be loaded, and return its index.
    if (!itemList.some((item) => item === `${nextIndex - 3}`)) {
      const batchIndex = Math.floor((nextIndex - 1) / batchSize);
      return [true, batchIndex - 1];
    }
    // Check if the item to prefetch is already loaded.
    if (itemList.some((item) => item === `${clampedIndex}`)) {
      return [false, 0];
    }
    // Return the index of the next batch to load.
    const batchIndex = Math.floor((nextIndex - 1) / batchSize);
    return [true, batchIndex + 1];
  }
  // Check if the current batch needs to be loaded, and return its index.
  if (!itemList.some((item) => item === `${nextIndex}`)) {
    const batchIndex = Math.floor((nextIndex - 1) / batchSize);
    return [true, batchIndex];
  }

  // Return false if no prefetch is needed.
  return [false, 0];
};

export const getIndexBatch = (index: number, batchSize: number) => {
  return Math.floor(index / batchSize);
};
