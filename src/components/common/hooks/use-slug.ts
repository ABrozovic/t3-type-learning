import { useRouter } from "next/router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { z } from "zod";
type UseSlug<T extends z.ZodTypeAny> = {
  isReady: boolean;
  query: z.infer<T>;
  addQuery: (name: string, value: string | string[] | number) => Promise<void>;
};
const useSlug = <T extends z.ZodTypeAny>(schema: T): UseSlug<T> => {
  const router = useRouter();
  const isReady = useRef(false);
  const [data, setData] = useState<UseSlug<T>["query"]>();
  const addQuery = useCallback(
    async (name: string, value: string | string[] | number) => {
      if (!router.query) return;
      await router.push(
        {
          query: { ...router.query, [name]: value },
        },
        undefined,
        { shallow: true, scroll: true }
      );
    },
    [router]
  );
  useEffect(() => {
    if (!router.isReady || isReady.current) return;
    try {
      isReady.current = true;
      setData(parse(schema, router.query));
    } catch (err) {
      console.error("Error in query");
    }
  }, [router.isReady, router.query, schema]);

  // const data = useMemo(() => {
  //   if (!router.isReady || isReady.current) return;
  //   try {
  //     isReady.current = true;
  //     return parse(schema, router.query);
  //   } catch (err) {
  //     console.error("Error in query");
  //   }
  // }, [router.isReady, router.query, schema]);

  return { isReady: isReady.current, query: data || {}, addQuery };
};
export default useSlug;

export const parse = <T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): unknown => {
  try {
    return schema.parse(data);
  } catch (err) {
    throw new Error();
  }
};
