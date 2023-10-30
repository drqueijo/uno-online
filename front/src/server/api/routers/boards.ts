/* eslint-disable @typescript-eslint/no-misused-promises */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";
import { CreateBoardUseCase } from "../modules/Boards/CreateBoard/CreateBoardUseCase";
import { BoardRepository } from "../repository/BoardRepository";
import { UpdateBoardUseCase } from "../modules/Boards/UpdateBoard/UpdateBoardUseCase";
import { DeleteBoardUseCase } from "../modules/Boards/DeleteBoard/DeleteBoardUseCase";
import { GetBoardByUserBoardUseCase } from "../modules/Boards/GetBoardByUser/GetBoardByUserUseCase";
import { TeamRepository } from "../repository/TeamRepository";

export const boardsRouter = createTRPCRouter({
  getMyBoards: protectedProcedure
    .input(z.object({ userId: z.string().nullable().optional() }))
    .query(async ({ input }) => {
      const response = await new GetBoardByUserBoardUseCase(
        new BoardRepository(),
        new TeamRepository()
      ).execute(input);
      return response.reponse;
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
        teamId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await new CreateBoardUseCase(
        new BoardRepository()
      ).execute(input);
      return response;
    }),
  updateBoard: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        teamId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const response = await new UpdateBoardUseCase(
        new BoardRepository()
      ).execute(input);
      return response;
    }),
  deleteBoard: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
      })
    )
    .mutation(({ input }) => {
      const response = new DeleteBoardUseCase(new BoardRepository()).execute({
        id: input.boardId,
      });
      return response;
    }),
});
