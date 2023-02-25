import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type { GetServerSidePropsContext } from "next";
import { useState } from "react";
import superjson from "superjson";
import useSlug from "../../components/common/hooks/use-slug";
import MonacoWrapper from "../../components/monaco-wrapper";
import { appRouter } from "../../server/api/root";
import type { SubjectWithIndexedChallenges } from "../../server/api/routers/subjects/get-subject";
import { challengeStorage } from "../../server/api/routers/subjects/get-subject";
import { createTRPCContext } from "../../server/api/trpc";
import { api } from "../../utils/api";
import { findIndexInArray } from "../../utils/array-utils";
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
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
  if (!isReady || !data) return null;
  const setData = (challenges: SubjectWithIndexedChallenges["challenges"]) => {
    utils.subject.get.setData(
      {
        slug: "basic-types",
        skip: `${parseInt(skip || "0")}`,
        take: `${parseInt(take || "0")}`,
      },
      {
        ...data,
        challenges,
      }
    );
  };
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
  const handleValidate = (errors: number) => {
    if (errors > 0 || !data) return;
    const { updatedChallenges, challengeToUpdate } = getNewArrayAndElement(
      data,
      currentChallenge
    );

    if (challengeToUpdate?.challengeStorage.status === "UNSOLVED") {
      updateChallengeStorage(
        challengeToUpdate,
        updatedChallenges,
        currentChallenge,
        "CHEERING"
      );

      setData(updatedChallenges);
    }
  };

  const handleConfetiComplete = () => {
    const { updatedChallenges, challengeToUpdate } = getNewArrayAndElement(
      data,
      currentChallenge
    );
    if (!challengeToUpdate) return;
    updateChallengeStorage(
      challengeToUpdate,
      updatedChallenges,
      currentChallenge,
      "GREEN"
    );

    setData(updatedChallenges);
  };

  return (
    <>
      <MonacoWrapper
        onValidate={handleValidate}
        subject={data}
        currentChallenge={currentChallenge}
        onPageChanged={handleVoidPromise(handlePageChange)}
        onConfettiComplete={handleConfetiComplete}
      />
      <p>{data.challenges[0]?.challengeStorage.status}</p>
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
function getNewArrayAndElement(
  data: SubjectWithIndexedChallenges,
  currentChallenge: number
) {
  const updatedChallenges = [...data.challenges];
  const challengeToUpdate =
    updatedChallenges[findIndexInArray(updatedChallenges, currentChallenge)];
  return { challengeToUpdate, updatedChallenges };
}

function updateChallengeStorage(
  challengeToUpdate: SubjectWithIndexedChallenges["challenges"][number],
  updatedChallenges: SubjectWithIndexedChallenges["challenges"],
  currentChallenge: number,
  challengeStatus?:
    | SubjectWithIndexedChallenges["challenges"][number]["challengeStorage"]["status"]
    | null,
  challengeSolution?:
    | SubjectWithIndexedChallenges["challenges"][number]["challengeStorage"]["userSolution"]
    | null
) {
  const updatedChallenge = {
    ...challengeToUpdate,
    challengeStorage: challengeStorage.parse({
      ...challengeToUpdate.challengeStorage,
      status: challengeStatus ?? challengeToUpdate.challengeStorage.status,
      userSolution:
        challengeSolution ?? challengeToUpdate.challengeStorage.userSolution,
    }),
  };
  updatedChallenges[currentChallenge] = updatedChallenge;
}
