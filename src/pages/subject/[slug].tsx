import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { GetServerSidePropsContext } from "next";
import { useState } from "react";
import superjson from "superjson";
import useSlug from "../../components/common/hooks/use-slug";
import MonacoWrapper from "../../components/monaco-wrapper";
import { appRouter } from "../../server/api/root";
import { createTRPCContext } from "../../server/api/trpc";
import { api } from "../../utils/api";
import { handleVoidPromise } from "../../utils/handle-void-promises";
import { shouldPrefetchNextBatch } from "../../utils/pagination-helper";
type SubjectQuery = {
  slug: string;
  skip: string;
  take: string;
};

const Subject = () => {
  const {
    isReady,
    data: { slug, skip, take },
  } = useSlug<SubjectQuery>();
  const [currentChallenge, setCurrentChallenge] = useState(
    parseInt(skip || "0")
  );
  const utils = api.useContext();
  const { data } = api.subject.get.useQuery(
    {
      slug: slug || "",
      take: take || "0",
      skip: skip || "0",
    },
    {
      enabled: !!isReady,
      refetchOnWindowFocus: false,
      refetchInterval: 10000,
      refetchOnReconnect: false,
    }
  );
  const handlePageChange = async (page: number) => {
    const [prefetch, batch] = shouldPrefetchNextBatch(
      data?.challenges,
      data?._count?.challenges,
      currentChallenge,
      page,
      2,
      take
    );

    if (prefetch) {
      const newData = await utils.subject.get.fetch({
        slug: "basic-types",
        skip: `${parseInt(take || "0") * batch}`,
        take: `${parseInt(take || "0")}`,
      });

      if (!newData || !data || !data.challenges) return;

      const updatedChallenges = [
        ...data.challenges,
        ...newData.challenges,
      ].reduce(
        (
          acc: (typeof newData.challenges)[number][],
          item: (typeof newData.challenges)[number]
        ) => {
          if (acc.some((i) => i.index === item.index)) {
            return acc;
          } else {
            return [...acc, item];
          }
        },
        []
      );
      utils.subject.get.setData(
        {
          slug: "basic-types",
          skip: `${parseInt(skip || "0")}`,
          take: `${parseInt(take || "0")}`,
        },
        {
          ...newData,
          _count: newData._count,
          challenges: updatedChallenges,
        }
      );
    }

    setCurrentChallenge(page - 1);
  };

  if (!isReady || !data) return null;
  return (
    <>
      <MonacoWrapper
        subject={data}
        currentChallenge={currentChallenge}
        onPageChanged={handleVoidPromise(handlePageChange)}
      />
    </>
  );
};
export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const slug = "basic-types";
  const query = ctx.query as unknown as SubjectQuery;
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext(ctx),
    transformer: superjson,
  });
  await ssg.subject.get.prefetch({
    slug: query.slug,
    take: query.take || "0",
    skip: query.skip || "0",
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
    },
  };
};

export default Subject;
