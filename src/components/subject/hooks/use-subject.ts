import type { RangeRestriction } from "@/components/monaco-wrapper";
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
  const updateChallenge = (status?: ChallengeStatus, text?: string) => {
    if (!currentChallenge) return;
    const updatedChallenges = {
      ...data.challenges,
      [currentChallengeIndex]: {
        ...currentChallenge,
        status: status ? status : currentChallenge.status,
        problem: text ? text : currentChallenge.problem,
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
  const mapRestrictions = () => {
    return currentChallenge?.restrictions.map((r) => ({
      label: r.label,
      allowMultiline: r.allowMultiline,
      range: [r.initialRow, r.initialColumn, r.finalRow, r.finalColumn],
    })) as RangeRestriction[];
  };

  return {
    currentChallenge,
    data,
    updateChallenge,
    mapRestrictions,    
    isChallengeStatus,
    currentChallengeIndex,
    setCurrentChallengeIndex,
  };
};
