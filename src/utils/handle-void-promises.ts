export const handleVoidPromise = <T>(promise: (_event: React.SyntheticEvent) => Promise<T>) => {
  return (event: React.SyntheticEvent) => {
    if (promise) {
      promise(event).catch((error) => {
        console.error("Unexpected error:", error);
      });
    }
  };
};