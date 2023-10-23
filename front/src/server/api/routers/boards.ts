/* eslint-disable @typescript-eslint/no-misused-promises */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";
import { BoardRepository } from "../repository/BoardRepository";
import { ZodError } from "../core/errors/ZodError";
import { CreateBoardUseCase } from "../modules/Boards/CreateBoard/CreateBoardUseCase";

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
    .mutation(async ({ input }) => {
      let response;
      try {
        const payload = {
          name: input.name,
          teamId: input.team,
        };
        response = await new CreateBoardUseCase(
          new BoardRepository(),
          new ZodError()
        ).execute(payload);
      } catch (err) {
        if (err instanceof ZodError) response = err;
      }
      return response;
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
