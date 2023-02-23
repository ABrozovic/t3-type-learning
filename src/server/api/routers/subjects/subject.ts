import { createTRPCRouter, publicProcedure } from "../../trpc";
import { getSubject, getSubjectSchema } from "./get-subject";

export const subjectRouter = createTRPCRouter({
  get: publicProcedure.input(getSubjectSchema).query(async ({ input, ctx }) => {
    return await getSubject({ input, prisma: ctx.prisma });
  }),
  test: publicProcedure
    .input(getSubjectSchema)
    .query(async ({ input, ctx }) => {
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
