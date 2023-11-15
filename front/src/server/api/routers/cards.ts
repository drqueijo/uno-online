/* eslint-disable @typescript-eslint/no-misused-promises */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";
import { type Card } from "@prisma/client";

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
    .mutation(async ({ input, ctx }) => {
      const card = await ctx.prisma.card.create({
        data: {
          title: input.title,
          content: input.content,
          board: { connect: { id: input.boardId } },
          status: { connect: { id: input.statusId } },
          creator: { connect: { id: input.creatorId } },
        },
      });
      if (!card.id) return;
      await ctx.prisma.cardHistory.create({
        data: {
          title: input.title,
          content: input.content,
          board: { connect: { id: input.boardId } },
          status: { connect: { id: input.statusId } },
          creator: { connect: { id: input.creatorId } },
          cardId: card.id,
        },
      });
      return card;
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
    .mutation(async ({ input, ctx }) => {
      const card = await ctx.prisma.card.update({
        where: {
          id: input.id,
        },
        data: {
          title: input.title,
          content: input.content,
          status: { connect: { id: input.statusId } },
        },
      });

      if (!card.id) return;
      await ctx.prisma.cardHistory.create({
        data: {
          title: input.title,
          content: input.content,
          board: { connect: { id: card.boardId } },
          status: { connect: { id: card.statusId } },
          creator: { connect: { id: card.creatorId } },
          cardId: card.id,
        },
      });
      return card;
    }),
  moveCards: protectedProcedure
    .input(
      z.array(
        z.object({
          id: z.string(),
          orderIndex: z.number(),
          statusId: z.string(),
        })
      )
    )
    .mutation(({ input, ctx }) => {
      const updatePromises = input.map((cardData) => {
        return ctx.prisma.card.update({
          where: {
            id: cardData.id,
          },
          data: {
            orderIndex: cardData.orderIndex,
            status: { connect: { id: cardData.statusId } },
          },
        });
      });

      return Promise.all(updatePromises);
    }),
  deleteCard: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.card.delete({
        where: {
          id: input.id,
        },
      });
    }),
  getCardsBySprintId: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id } = ctx.session.user;
      const cards: Card[] = [];
      const rest: Card[] = [];
      if (!input.id)
        return {
          cards,
          rest,
        };

      const allCards = await ctx.prisma.card.findMany({
        include: {
          status: true,
        },
      });
      allCards.forEach((a) => {
        if (a.sprintId === input.id) return cards.push(a);
        if (a.creatorId === id) return rest.push(a);
      });

      return {
        cards,
        rest,
      };
    }),
});
