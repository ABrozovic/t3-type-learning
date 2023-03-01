import { createTRPCRouter, publicProcedure } from "../../trpc";
import { createSubject, subjectSchema } from "./create-subject";
import { getSubject, getSubjectSchema } from "./get-subject";

export const subjectRouter = createTRPCRouter({
  get: publicProcedure.input(getSubjectSchema).query(async ({ input, ctx }) => {
    return await getSubject({ input, prisma: ctx.prisma });
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.subject.findMany();
  }),
  create: publicProcedure
    .input(subjectSchema)
    .mutation(async ({ input, ctx }) => {
      return await createSubject({ input, prisma: ctx.prisma });
    }),
});
