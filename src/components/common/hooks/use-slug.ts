import { useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";

const useSlug = <T>() => {
  const router = useRouter();
  const isReady = useRef(false);
  const addQuery = useCallback(
    async (name: string, value: string | string[] | number) => {
      await router.push(
        {
          query: { ...router.query, [name]: value },
        },
        undefined
      );
    },
    [router]
  );
  const data = useMemo(() => {
    if (!router.isReady) return;
    isReady.current = false;
    return router.query;
  }, [router.isReady, router.query]);

  return { isReady, data: data as T };
};
export default useSlug;
