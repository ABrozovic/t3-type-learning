import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { getSubject } from "./get-subject";

export const getSubjectInput = z.object({
  slug: z.string(),
  cursor: z.string().optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
});
export type GetSubject = z.infer<typeof getSubjectInput>;
export const subjectRouter = createTRPCRouter({
  get: publicProcedure.input(getSubjectInput).query(async ({ input, ctx }) => {
    return await getSubject({ input, prisma: ctx.prisma });
  }),
  test: publicProcedure.input(getSubjectInput).query(async ({ input, ctx }) => {
    const { slug, take = 1, skip, cursor } = input;
    const challenges = await ctx.prisma.challenge.findMany({
      where: { Subject: { slug } },
      take: take + 1,
      cursor: cursor ? { id: cursor } : undefined,
      orderBy: {
        id: "asc",
      },
      include: { restrictions: true },
    });    
    let nextCursor: typeof cursor | undefined = undefined;
    if (challenges.length > take) {
      const nextChallenge = challenges.pop();
      nextCursor = nextChallenge?.id;
    }
    return {
      challenges,
      nextCursor,
    };
  }),
});
