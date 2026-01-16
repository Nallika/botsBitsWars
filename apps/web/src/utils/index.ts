export const getRandomNum = (max: number, min: number = 0): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const getRandomEl = <T>(arr: T[]): T => {
  if (arr.length === 0) {
    throw new Error('Array must not be empty');
  }
  const idx = getRandomNum(arr.length - 1, 0);
  return arr[idx];
};
