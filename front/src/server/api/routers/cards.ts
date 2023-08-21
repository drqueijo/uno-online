/* eslint-disable @typescript-eslint/no-misused-promises */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";

export const cardsRouter = createTRPCRouter({
  getCardsByBoardId: protectedProcedure
    .input(z.object({ boardId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!input.boardId) return null;
      return ctx.prisma.board.findUnique({
        where: {
          id: input.boardId,
        },
        include: {
          cards: true,
          status: true,
        },
      });
    }),
  getCardBydId: protectedProcedure
    .input(z.object({ cardId: z.string().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.cardId) return null;
      return ctx.prisma.card.findUnique({
        where: {
          id: input.cardId,
        },
      });
    }),
  createCard: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        boardId: z.string(),
        statusId: z.string(),
        creatorId: z.string().optional(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.card.create({
        data: {
          title: input.title,
          content: input.content,
          board: { connect: { id: input.boardId } },
          status: { connect: { id: input.statusId } },
          creator: { connect: { id: input.creatorId } },
        },
      });
    }),
  updateCard: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
        title: z.string(),
        content: z.string(),
        statusId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.card.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          content: input.content,
          status: { connect: { id: input.statusId } },
        },
      });
    }),
});
