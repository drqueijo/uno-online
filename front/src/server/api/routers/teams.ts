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
  getTeamById: protectedProcedure
    .input(z.object({ id: z.string().nullable().optional() }))
    .query(({ input, ctx }) => {
      if (!input.id) return null;
      return ctx.prisma.team.findUnique({
        where: {
          id: input.id,
        },
        include: {
          users: true,
        },
      });
    }),
  createTeam: protectedProcedure
    .input(
      z.object({
        adminId: z.string(),
        name: z.string(),
        users: z.string().array(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.team.create({
        data: {
          ...input,
          users: {
            connect: input.users.map((user) => ({ id: user })),
          },
        },
      });
    }),
  deleteTeam: protectedProcedure
    .input(z.object({ userId: z.string().optional(), id: z.string() }))
    .mutation(({ input, ctx }) => {
      if (!input.userId) return;
      return ctx.prisma.team.delete({
        where: {
          adminId: input.userId,
          id: input.id,
        },
      });
    }),
  updateTeam: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        users: z.string().array(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.team.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
          users: { connect: input.users.map((user) => ({ id: user })) },
        },
      });
    }),
});
