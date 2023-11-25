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
          boards: {
            include: {
              cards: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
  getTeamAsMember: protectedProcedure
    .input(z.object({ userId: z.string().nullable().optional() }))
    .query(async ({ input, ctx }) => {
      if (!input.userId) return [];

      const teams = await ctx.prisma.team.findMany({
        where: {
          users: { some: { id: input.userId } },
        },
        include: {
          users: true,
          boards: {
            include: {
              cards: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const teamsWithAdmins = await Promise.all(
        teams.map(async (team) => {
          const adminUser = await ctx.prisma.user.findUnique({
            where: {
              id: team.adminId,
            },
          });

          return {
            ...team,
            admin: adminUser ?? null,
          };
        })
      );

      return teamsWithAdmins;
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
    .mutation(async ({ input, ctx }) => {
      if (!input.userId) return;
      await ctx.prisma.board.updateMany({
        where: {
          teamId: input.id,
        },
        data: {
          teamId: undefined,
        },
      });

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
    .mutation(async ({ input, ctx }) => {
      const existingTeam = await ctx.prisma.team.findUnique({
        where: {
          id: input.id,
        },
        include: {
          users: true,
        },
      });

      if (!existingTeam) {
        return null;
      }

      const usersToRemove = existingTeam.users.filter(
        (user) => !input.users.includes(user.id)
      );

      return ctx.prisma.team.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
          users: {
            connect: input.users.map((user) => ({ id: user })),
            disconnect: usersToRemove.map((user) => ({ id: user.id })),
          },
        },
      });
    }),
  generateSpreadSheet: protectedProcedure
    .input(z.object({ userId: z.string() }))
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
        WHERE ch.creatorId = ${input.userId}
        ORDER BY ch.createdAt ASC
      `;
      return cardsHistory;
    }),
});
