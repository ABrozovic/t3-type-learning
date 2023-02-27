import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import { useState } from "react";
import superjson from "superjson";
import useSlug from "../../components/common/hooks/use-slug";
import MonacoWrapper from "../../components/monaco-wrapper";
import { appRouter } from "../../server/api/root";
import type { SubjectWithIndexedChallenges } from "../../server/api/routers/subjects/get-subject";
import {
  challengeStorage,
  getSubjectSchema,
} from "../../server/api/routers/subjects/get-subject";
import { createTRPCContext } from "../../server/api/trpc";
import { api } from "../../utils/api";
import { findIndexInArray } from "../../utils/array-utils";
import { handleVoidPromise } from "../../utils/handle-void-promises";
import { shouldPrefetchNextBatch } from "../../utils/pagination-helper";
type SubjectQuery = {
  slug: string;
  skip: string;
  take: string;
  page: string;
};

const Subject = ({
  defaultPage = 1,
  defaultSkip = 0,
  defaultTake = 20,
  slug = "",
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { isReady, addQuery } = useSlug(getSubjectSchema);
  const [currentChallenge, setCurrentChallenge] = useState(defaultPage);
  const utils = api.useContext();
  const { data } = api.subject.get.useQuery(
    {
      slug: slug,
      skip: `${defaultSkip}`,
      take: `${defaultTake}`,
    },
    {
      enabled: isReady,
      keepPreviousData: true,
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
        skip: `${defaultSkip}`,
        take: `${defaultTake}`,
      },
      {
        ...data,
        challenges,
      }
    );
  };
  const handlePageChange = async (page: number) => {
    await addQuery("page", `${page}`);
    const [prefetch, batch] = shouldPrefetchNextBatch(
      data?.challenges,
      data?._count?.challenges,
      currentChallenge,
      page,
      2,
      defaultTake
    );

    if (prefetch) {
      const newData = await utils.subject.get.fetch({
        slug: "basic-types",
        skip: `${defaultTake * batch}`,
        take: `${defaultTake}`,
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
          skip: `${defaultSkip}`,
          take: `${defaultTake}`,
        },
        {
          ...newData,
          _count: newData._count,
          challenges: updatedChallenges,
        }
      );
    }

    const { updatedChallenges, challengeToUpdate } = getNewArrayAndElement(
      data,
      currentChallenge
    );
    if (!challengeToUpdate) return;
    if (challengeToUpdate?.challengeStorage.status !== "UNSOLVED") {
      updateChallengeStorage(
        challengeToUpdate,
        updatedChallenges,
        currentChallenge,
        "SOLVED"
      );

      setData(updatedChallenges);
    }

    setCurrentChallenge(page);
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

  const handleTextUpdate = (text: string) => {
    const { updatedChallenges, challengeToUpdate } = getNewArrayAndElement(
      data,
      currentChallenge
    );
    if (!challengeToUpdate) return;
    updateChallengeStorage(
      challengeToUpdate,
      updatedChallenges,
      currentChallenge,
      "CHEERING",
      text
    );

    setData(updatedChallenges);
  };

  return (
    <>
      <MonacoWrapper
        onTextChanged={handleTextUpdate}
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
  const query = ctx.query as unknown as SubjectQuery;
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createTRPCContext(ctx),
    transformer: superjson,
  });
  const data = getSubjectSchema.safeParse(query);
  if (!data.success) return { props: {} };

  const { slug = "", skip = 0, take = 5, page = 1 } = data.data;
  const defaultTake = take > page ? take : page;
  await ssg.subject.get.prefetch({
    slug: slug,
    skip: `${skip}`,
    take: `${defaultTake}`,
  });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      slug,
      defaultPage: page,
      defaultTake: defaultTake,
      defaultSkip: skip,
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

function updateChallengeStorage<
  T extends SubjectWithIndexedChallenges["challenges"]
>(
  challengeToUpdate: T[number],
  updatedChallenges: T,
  currentChallenge: number,
  challengeStatus: T[number]["challengeStorage"]["status"],
  challengeSolution?: string | undefined
) {  
  const updatedChallenge = {
    ...challengeToUpdate,
    problem: challengeSolution ? challengeSolution : challengeToUpdate.problem,
    challengeStorage: challengeStorage.parse({
      ...challengeToUpdate.challengeStorage,
      status: challengeStatus,
    }),
  };
  updatedChallenges[findIndexInArray(updatedChallenges, currentChallenge)] =
    updatedChallenge;
}
