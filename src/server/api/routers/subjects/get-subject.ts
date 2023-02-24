import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import type { RouterOutputs } from "../../../../utils/api";

export const getSubjectSchema = z.object({
  slug: z.string(),
  take: z
    .string()
    .optional()
    .transform((value) => parseInt(value || "1")),
  skip: z
    .string()
    .optional()
    .transform((value) => parseInt(value || "0")),
});
export type GetSubject = z.infer<typeof getSubjectSchema>;

export type SubjectWithIndexedChallenges = NonNullable<
  RouterOutputs["subject"]["get"]
>;
export const getSubject = async ({
  input,
  prisma,
}: {
  input: GetSubject;
  prisma: PrismaClient;
}) => {
  const { slug, take = 5, skip = 0 } = input;

  const subject = await prisma.subject.findFirst({
    where: { slug },
    include: {
      _count: {
        select: { challenges: true },
      },
      challenges: {
        take,
        skip: skip > 0 ? skip - 1 : skip,
        include: { restrictions: true },
      },
    },
  });
  if (!subject) return undefined;

  return {
    ...subject,
    challenges: subject.challenges.map((challenge, index) => ({
      index: index + skip,
      ...challenge,
    })),
  };
};

// subject.challenges= subject.challenges.map((challenge, index) => ({
//   index: index + (skip || 0),
//   challenge: challenge,
// })),
// const challengeSet = new Set<{
//   index: number;
//   challenge: (typeof subject.challenges)[number];
// }>();
// subject.challenges.forEach((challenge, i) =>
//   challengeSet.add({
//     index: i + (skip || 0),
//     challenge: challenge,
//   })
// );
// return await prisma.subject.findFirst({
//   where: { slug },
//   include: {
//     _count: {
//       select: { challenges: true },
//     },
//     challenges: { take, skip, include: { restrictions: true } },
//   },
// });
/*
  const subject = await prisma.subject.findFirst({
    where: { slug },
    include: {
      _count: {
        select: { challenges: true },
      },
      challenges: { take, skip, include: { restrictions: true } },
    },
  });
  if (!subject) return undefined;  
  const challengeSet = new Set<{
    index: number;
    challenge: (typeof subject.challenges)[number];
  }>();
  subject.challenges.forEach((challenge, i) =>
    challengeSet.add({
      index: i + (skip || 0),
      challenge: challenge,
    })
  );
  */
/*  const challenges = await prisma.challenge.findMany({
    where: { Subject: { slug } },
    take: take + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: {
      id: "asc",
    },
    include: { restrictions: true },
  });
  console.log("🚀 ~ file: get-subject.ts:29 ~ challenges:", challenges);
  let nextCursor: typeof cursor | undefined = undefined;
  if (challenges.length > take) {
    const nextChallenge = challenges.pop();
    nextCursor = nextChallenge?.id;
  }
  return {
    challenges,
    nextCursor,
  };
*/
