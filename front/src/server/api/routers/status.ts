/* eslint-disable @typescript-eslint/no-misused-promises */
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "next/server/api/trpc";

export const statusRouter = createTRPCRouter({
  createStatus: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        color: z.string(),
        boardId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.status.create({
        data: {
          name: input.name,
          color: input.color,
          board: { connect: { id: input.boardId } },
        },
      });
    }),
  updateStatus: protectedProcedure
    .input(
      z.object({
        statusId: z.string(),
        name: z.string(),
        color: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.status.update({
        where: {
          id: input.statusId,
        },
        data: {
          name: input.name,
          color: input.color,
        },
      });
    }),
  getStatus: protectedProcedure
    .input(
      z.object({
        boardId: z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.status.findMany({
        where: {
          boardId: input.boardId,
        },
      });
    }),
  getStatusById: protectedProcedure
    .input(
      z.object({
        statusId: z.string().optional(),
      })
    )
    .query(({ input, ctx }) => {
      return ctx.prisma.status.findUnique({
        where: {
          id: input.statusId,
        },
      });
    }),
});
