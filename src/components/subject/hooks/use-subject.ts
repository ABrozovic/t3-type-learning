import type {
  ChallengeStatus,
  SubjectWithIndexedChallenges,
} from "@/server/api/routers/subject/get-subject";
import { api } from "@/utils/api";
import { shouldPrefetchNextBatch } from "@/utils/pagination-helper";
import { useState } from "react";
type ChallengeQuery = {
  slug: string;
  skip: number;
  take: number;
  page: number;
};

export const useSubject = ({ skip, take, slug, page }: ChallengeQuery) => {
  const [currentChallengeIndex, setCurrentChallengeIndexState] = useState(page);

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
  if (!data) return;
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

  const currentChallenge = data?.challenges[currentChallengeIndex];
  const updateStatus = (status: ChallengeStatus) => {
    if (!currentChallenge) return;
    const updatedChallenges = {
      ...data.challenges,
      [currentChallengeIndex]: {
        ...currentChallenge,
        status: status,
      },
    };
    setData(updatedChallenges);
  };

  const updateText = (text: string) => {
    if (!currentChallenge) return;
    const updatedChallenges = {
      ...data.challenges,
      [currentChallengeIndex]: {
        ...currentChallenge,
        problem: text,
      },
    };
    setData(updatedChallenges);
  };

  const prefetch = async (newPage: number) => {
    const [prefetch, batch] = shouldPrefetchNextBatch(
      Object.keys(data.challenges),
      data._count?.challenges,
      currentChallengeIndex,
      newPage,
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

      const updatedChallenges = { ...newData.challenges, ...data.challenges };

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
  };
  const setCurrentChallengeIndex = async (index: number) => {
    await prefetch(index);
    setCurrentChallengeIndexState(index);
  };
  const isChallengeStatus = (status: ChallengeStatus) => {
    return currentChallenge?.status == status;
  };

  return {
    currentChallenge,
    data,
    updateStatus,
    updateText,
    isChallengeStatus,
    currentChallengeIndex,
    setCurrentChallengeIndex,
  };
};