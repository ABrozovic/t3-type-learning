import type { RouterOutputs } from "@/utils/api";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

export const getSubjectSchema = z.object({
  slug: z.string().min(3),
  take: z
    .string()
    .optional()
    .transform((value) => parseInt(value || "20")),
  skip: z
    .string()
    .optional()
    .transform((value) => parseInt(value || "0")),
  page: z
    .string()
    .optional()
    .transform((value) => parseInt(value || "1")),
});
export const challengeStatusSchema = z
  .union([
    z.literal("UNSOLVED"),
    z.literal("CHEERING"),
    z.literal("GREEN"),
    z.literal("SOLVED"),
  ])
  .default("UNSOLVED");

export type GetSubject = z.infer<typeof getSubjectSchema>;
export type ChallengeStatus = z.infer<typeof challengeStatusSchema>;
type IndexedChallenges<T> = {
  [index: number]: T & { status: ChallengeStatus };
};
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
    _count: { challenges: subject._count.challenges - 1 },
    challenges: subject.challenges.reduce(
      (
        obj: IndexedChallenges<(typeof subject.challenges)[number]>,
        challenge,
        index,
      ) => {
        obj[index + (skip === 0 ? 1 : skip)] = {
          ...challenge,
          status: "UNSOLVED",
        };
        return obj;
      },
      {},
    ),
  };
};
