/* eslint-disable @typescript-eslint/no-misused-promises */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";

export const boardsRouter = createTRPCRouter({
  getMyBoards: protectedProcedure
    .input(z.object({ userId: z.string().nullable().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.userId) return null;

      const myTeams = await ctx.prisma.team.findMany({
        where: {
          adminId: input.userId,
        },
      });
      const teamMember = await ctx.prisma.team.findMany({
        where: {
          users: { some: { id: input.userId } },
        },
      });

      const teams = [...myTeams, ...teamMember];
      const myTeamsWithBoards = Promise.all(
        teams.map(async (team) => {
          const boards = await ctx.prisma.board.findMany({
            where: {
              teamId: team.id,
            },
            include: {
              cards: true,
            },
          });
          return { ...team, boards };
        })
      );
      return myTeamsWithBoards;
    }),
  getBoardById: protectedProcedure
    .input(z.object({ id: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.id) return null;

      return ctx.prisma.board.findUnique({
        where: {
          id: input.id,
        },
        include: {
          team: true,
        },
      });
    }),
  createBoard: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        team: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.board.create({
        data: {
          ...input,
          team: {
            connect: { id: input.team },
          },
        },
      });
    }),
  deleteBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.board.delete({
        where: {
          id: input.boardId,
        },
      });
    }),
});
