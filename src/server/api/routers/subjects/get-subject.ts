import type { PrismaClient } from "@prisma/client";
import type { GetSubject } from "./subject";

export const getSubject = async ({
  input,
  prisma,
}: {
  input: GetSubject;
  prisma: PrismaClient;
}) => {
  const { slug, take = 1, skip, cursor } = input;
  return await prisma.subject.findFirst({
    where: { slug },
    include: {
      _count: {
        select: { challenges: true },
      },
      challenges: { take, skip, include: { restrictions: true } },
    },
  });
};
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
