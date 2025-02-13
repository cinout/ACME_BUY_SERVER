export function selectRandomItemFromArray<T>(list: T[]) {
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}
