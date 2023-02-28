import { useState } from "react";
import type { SubjectWithIndexedChallenges } from "../../../server/api/routers/subjects/get-subject";
import { api } from "../../../utils/api";
import { findIndexInArray } from "../../../utils/array-utils";
import { shouldPrefetchNextBatch } from "../../../utils/pagination-helper";
type ChallengeQuery = {
  slug: string;
  skip: number;
  take: number;
  defaultPage: number;
};

export const useSubject = ({
  skip = 0,
  take = 20,
  slug = "",
  defaultPage = 0,
}: ChallengeQuery) => {
  const [currentChallenge, setCurrentChallenge] = useState(defaultPage);
  const utils = api.useContext();
  const { data } = api.subject.get.useQuery(
    {
      slug: slug,
      skip: `${skip}`,
      take: `${take}`,
    },
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }
  );
  const setData = (challenges: SubjectWithIndexedChallenges["challenges"]) => {
    if (!data) return;
    utils.subject.get.setData(
      {
        slug,
        skip: `${skip}`,
        take: `${take}`,
      },
      {
        ...data,
        challenges,
      }
    );
  };
  const challengeData = () =>
    getNewArrayAndElement(
      utils.subject.get.getData({
        slug,
        skip: `${skip}`,
        take: `${take}`,
      }),
      currentChallenge
    );

  const updateStatus = (
    status: SubjectWithIndexedChallenges["challenges"][number]["status"]
  ) => {
    const { updatedChallenges, challengeToUpdate } = challengeData();
    if (!challengeToUpdate) return;

    updateChallengeStorage(
      challengeToUpdate,
      updatedChallenges,
      currentChallenge,
      status,
      challengeToUpdate.problem
    );

    setData(updatedChallenges);
  };

  const updateText = (text: string) => {
    const { updatedChallenges, challengeToUpdate } = challengeData();
    if (!challengeToUpdate) return;

    updateChallengeStorage(
      challengeToUpdate,
      updatedChallenges,
      currentChallenge,
      challengeToUpdate.status,
      text
    );

    setData(updatedChallenges);
  };
  const fetchChallenge = async (page: number) => {
    if (!data || !data.challenges) return;

    const [prefetch, batch] = shouldPrefetchNextBatch(
      data.challenges,
      data._count?.challenges,
      currentChallenge,
      page,
      2,
      take
    );

    if (prefetch) {
      const newData = await utils.subject.get.fetch({
        slug,
        skip: `${take * batch}`,
        take: `${take}`,
      });

      if (!newData || !newData.challenges) return;

      const updatedChallenges = [
        ...data.challenges,
        ...newData.challenges.filter((c) => !data.challenges.some((dc) => dc.index === c.index))
      ];

      utils.subject.get.setData(
        {
          slug,
          skip: `${skip}`,
          take: `${take}`,
        },
        {
          ...newData,
          _count: newData._count,
          challenges: updatedChallenges,
        }
      );
    }

    const challengeToUpdate = data.challenges.find((c) => c.index === currentChallenge);

    if (!challengeToUpdate || challengeToUpdate.status === "UNSOLVED") return;

    const updatedChallenges = [...data.challenges];

    updateChallengeStorage(
      challengeToUpdate,
      updatedChallenges,
      challengeToUpdate.index,
      "SOLVED"
    );

    setData(updatedChallenges);
  };


  return {
    challengeData,
    data,
    fetchChallenge,
    updateStatus,
    updateText,
    currentChallenge,
    setCurrentChallenge,
  };
};

function getNewArrayAndElement(
  data: SubjectWithIndexedChallenges | undefined,
  currentChallenge: number
) {
  const updatedChallenges = data ? [...data.challenges] : [];
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
  challengeStatus: T[number]["status"],
  challengeSolution?: string | undefined
) {
  const updatedChallenge = {
    ...challengeToUpdate,
    problem: challengeSolution ? challengeSolution : challengeToUpdate.problem,
    status: challengeStatus,
  };
  updatedChallenges[findIndexInArray(updatedChallenges, currentChallenge)] =
    updatedChallenge;
}
