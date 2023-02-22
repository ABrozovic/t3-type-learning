import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../../trpc";
import { getSubject } from "./get-subject";

export const subjectRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input: { slug }, ctx }) => {
      return await getSubject({ slug, prisma: ctx.prisma });

    }),
});
