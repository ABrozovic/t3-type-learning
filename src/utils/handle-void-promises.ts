export const handleVoidPromise = <T, P extends unknown[]>(
  promise: (...args: P) => Promise<T>
) => {
  return (...args: P) => {
    if (promise) {
      promise(...args).catch((error) => {
        console.error("Unexpected error:", error);
      });
    }
  };
};
