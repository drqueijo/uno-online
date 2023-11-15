/* eslint-disable @typescript-eslint/no-misused-promises */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";

export const sprintsRouter = createTRPCRouter({
  createSprint: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        startAt: z.string(),
        endAt: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.sprint.create({
        data: {
          ...input,
          creator: { connect: { id: ctx.session.user.id } },
        },
      });
    }),
  updateSprint: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        startAt: z.string(),
        endAt: z.string(),
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.sprint.update({
        where: { id: input.id },
        data: input,
      });
    }),
  getSprints: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    return ctx.prisma.sprint.findMany({
      where: { creatorId: userId },
    });
  }),
  getById: protectedProcedure
    .input(
      z.object({
        id: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!input.id) return null;
      return ctx.prisma.sprint.findUnique({
        where: { id: input.id },
      });
    }),
  addCardtoSprint: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        sprintId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const card = await ctx.prisma.card.update({
        where: {
          id: input.cardId,
        },
        data: {
          sprintId: input.sprintId,
        },
      });

      await ctx.prisma.cardHistory.create({
        data: {
          title: card.title,
          content: card.content,
          boardId: card.boardId,
          statusId: card.statusId,
          creatorId: card.creatorId,
          cardId: card.id,
          sprintId: input.sprintId,
        },
      });
      return card;
    }),
  removeCardFromSprint: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        sprintId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const card = await ctx.prisma.card.update({
        where: {
          id: input.cardId,
        },
        data: {
          sprintId: null,
        },
      });

      await ctx.prisma.cardHistory.create({
        data: {
          title: card.title,
          content: card.content,
          boardId: card.boardId,
          statusId: card.statusId,
          creatorId: card.creatorId,
          cardId: card.id,
          sprintId: input.sprintId,
        },
      });
      return card;
    }),
  deleteSprint: protectedProcedure
    .input(
      z.object({
        sprintId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ctx.prisma.card.updateMany({
        where: {
          sprintId: input.sprintId,
        },
        data: {
          sprintId: null,
        },
      });
      return await ctx.prisma.sprint.delete({
        where: {
          id: input.sprintId,
        },
      });
    }),

  generateSpreadSheet: protectedProcedure
    .input(z.object({ sprintId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const cardsHistory = await ctx.prisma.$queryRaw`
        SELECT 
          ch.content,
          ch.title,
          ch.createdAt,
          ch.updatedAt,
          ch.orderIndex,
          c.title as cardName,
          u.name as creatorName,
          s.name as statusName,
          b.name as boardName
        FROM CardHistory ch
        JOIN Card c ON ch.cardId = c.id
        JOIN User u ON ch.creatorId = u.id
        JOIN Status s ON ch.statusId = s.id
        JOIN Board b ON ch.boardId = b.id
        WHERE ch.sprintId = ${input.sprintId}
        ORDER BY ch.createdAt ASC
      `;

      return cardsHistory;
    }),
});
