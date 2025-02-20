export function shuffleArray<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
    [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
  }
  return arr;
}

export function selectRandomItemFromArray<T>(list: T[]) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

export function selectRandomNItemsFromArray<T>(list: T[], take: number) {
  const allIndices = Array.from(
    { length: list.length },
    (value, index) => index
  );
  shuffleArray(allIndices);
  const selectedIndices = allIndices.slice(0, take);
  const selectedItems = selectedIndices.map((a) => list[a]);
  return selectedItems;
}
