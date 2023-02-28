import { useState } from "react";
import type { SubjectWithIndexedChallenges } from "../../../server/api/routers/subjects/get-subject";
import { api } from "../../../utils/api";
type ChallengeQuery = {
  slug: string;
  skip: number;
  take: number;
  page: number;
};

export const useSubject = ({ skip, take, slug, page }: ChallengeQuery) => {
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(page);

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
  const updateStatus = (
    status: SubjectWithIndexedChallenges["challenges"][number]["status"]
  ) => {
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
        ...data.challenges[currentChallengeIndex],
        problem: text,
      },
    };
    setData(updatedChallenges);
  };


  return {
    currentChallenge,
    data,
  
    updateStatus,
    updateText,
    currentChallengeIndex,
    setCurrentChallengeIndex,
  };
};

