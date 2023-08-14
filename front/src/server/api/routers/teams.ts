import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";

export const teamsRouter = createTRPCRouter({
  getMyTeams: protectedProcedure
    .input(z.object({ userId: z.string().nullable().optional() }))
    .query(({ input, ctx }) => {
      if (!input.userId) return [];
      return ctx.prisma.team.findMany({
        where: {
          adminId: input.userId,
        },
        include: {
          users: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  createTeam: protectedProcedure
    .input(z.object({ adminId: z.string(), name: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.team.create({
        data: {
          ...input,
        },
      });
    }),
  deleteTeam: protectedProcedure
    .input(z.object({ userId: z.string(), id: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.team.delete({
        where: {
          adminId: input.userId,
          id: input.id,
        },
      });
    }),
});
