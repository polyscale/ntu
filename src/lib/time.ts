export const measureTime = async <T>(fn: () => Promise<T>) => {
  const start = Date.now();

  const returnValue = await fn();

  return { time: Date.now() - start, returnValue };
};
